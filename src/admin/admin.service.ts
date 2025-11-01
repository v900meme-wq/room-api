import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats(startDate?: Date, endDate?: Date) {
        const dateFilter = {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
        };

        const [
            totalUsers,
            totalHouses,
            totalRooms,
            totalPayments,
            activeUsers,
            occupiedRooms,
            revenueStats,
            unpaidPayments,
            recentActivities,
        ] = await Promise.all([
            // Total users
            this.prisma.user.count(),

            // Total houses
            this.prisma.house.count(),

            // Total rooms
            this.prisma.room.count(),

            // Total payments
            this.prisma.monthlyPayment.count({
                where: startDate || endDate ? { createdAt: dateFilter } : undefined,
            }),

            // Active users (có phòng đang thuê)
            this.prisma.user.count({
                where: {
                    status: true,
                    houses: {
                        some: {
                            rooms: {
                                some: {
                                    status: 'rented',
                                },
                            },
                        },
                    },
                },
            }),

            // Occupied rooms
            this.prisma.room.count({
                where: { status: 'rented' },
            }),

            // Revenue statistics
            this.getRevenueStats(startDate, endDate),

            // Unpaid payments
            this.getUnpaidPayments(),

            // Recent activities (audit logs)
            this.getRecentActivities(),
        ]);

        const availableRooms = totalRooms - occupiedRooms;
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        return {
            overview: {
                totalUsers,
                totalHouses,
                totalRooms,
                totalPayments,
                activeUsers,
                occupiedRooms,
                availableRooms,
                occupancyRate: Math.round(occupancyRate * 100) / 100,
            },
            revenue: revenueStats,
            unpaidPayments,
            recentActivities,
        };
    }

    private async getRevenueStats(startDate?: Date, endDate?: Date) {
        const dateFilter = {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
        };

        const payments = await this.prisma.monthlyPayment.findMany({
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
            select: {
                totalAmount: true,
                status: true,
                month: true,
                year: true,
            },
        });

        const totalRevenue = payments.reduce(
            (sum, p) => sum + Number(p.totalAmount),
            0,
        );

        const paidRevenue = payments
            .filter((p) => p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.totalAmount), 0);

        const unpaidRevenue = payments
            .filter((p) => p.status === 'unpaid')
            .reduce((sum, p) => sum + Number(p.totalAmount), 0);

        // Revenue by month
        const revenueByMonth = payments.reduce((acc, payment) => {
            const key = `${payment.year}-${String(payment.month).padStart(2, '0')}`;
            if (!acc[key]) {
                acc[key] = {
                    month: payment.month,
                    year: payment.year,
                    total: 0,
                    paid: 0,
                    unpaid: 0,
                    count: 0,
                };
            }
            acc[key].total += Number(payment.totalAmount);
            if (payment.status === 'paid') {
                acc[key].paid += Number(payment.totalAmount);
            } else {
                acc[key].unpaid += Number(payment.totalAmount);
            }
            acc[key].count += 1;
            return acc;
        }, {} as Record<string, any>);

        return {
            totalRevenue,
            paidRevenue,
            unpaidRevenue,
            totalPaidPayments: payments.filter((p) => p.status === 'paid').length,
            totalUnpaidPayments: payments.filter((p) => p.status === 'unpaid').length,
            revenueByMonth: Object.values(revenueByMonth).sort(
                (a: any, b: any) => b.year - a.year || b.month - a.month,
            ),
        };
    }

    private async getUnpaidPayments() {
        const unpaidPayments = await this.prisma.monthlyPayment.findMany({
            where: { status: 'unpaid' },
            include: {
                room: {
                    select: {
                        id: true,
                        roomName: true,
                        renter: true,
                        phone: true,
                        house: {
                            select: {
                                id: true,
                                address: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            take: 20,
        });

        return unpaidPayments.map((payment) => ({
            ...payment,
            totalAmount: Number(payment.totalAmount),
            roomPrice: Number(payment.roomPrice),
            electPrice: Number(payment.electPrice),
            waterPrice: Number(payment.waterPrice),
            trashFee: Number(payment.trashFee),
            washingMachineFee: Number(payment.washingMachineFee),
            elevatorFee: Number(payment.elevatorFee),
        }));
    }

    private async getRecentActivities() {
        const activities = await this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return activities.map((log) => ({
            ...log,
            oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
            newValue: log.newValue ? JSON.parse(log.newValue) : null,
        }));
    }

    async getUserStats() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                phone: true,
                roomLimit: true,
                isAdmin: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        houses: true,
                    },
                },
            },
        });

        const usersWithRoomCount = await Promise.all(
            users.map(async (user) => {
                const roomCount = await this.prisma.room.count({
                    where: {
                        house: {
                            userId: user.id,
                        },
                    },
                });

                return {
                    ...user,
                    houseCount: user._count.houses,
                    roomCount,
                    roomUtilization:
                        user.roomLimit && user.roomLimit > 0
                            ? Math.round((roomCount / user.roomLimit) * 100)
                            : null,
                };
            }),
        );

        return usersWithRoomCount;
    }

    async getHouseStats() {
        const houses = await this.prisma.house.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        rooms: true,
                    },
                },
            },
        });

        const housesWithStats = await Promise.all(
            houses.map(async (house) => {
                const [totalRooms, occupiedRooms, totalRevenue] = await Promise.all([
                    this.prisma.room.count({
                        where: { houseId: house.id },
                    }),
                    this.prisma.room.count({
                        where: { houseId: house.id, status: 'rented' },
                    }),
                    this.prisma.monthlyPayment.aggregate({
                        where: {
                            room: {
                                houseId: house.id,
                            },
                            status: 'paid',
                        },
                        _sum: {
                            totalAmount: true,
                        },
                    }),
                ]);

                return {
                    ...house,
                    totalRooms,
                    occupiedRooms,
                    availableRooms: totalRooms - occupiedRooms,
                    occupancyRate:
                        totalRooms > 0
                            ? Math.round((occupiedRooms / totalRooms) * 100)
                            : 0,
                    totalRevenue: totalRevenue._sum.totalAmount
                        ? Number(totalRevenue._sum.totalAmount)
                        : 0,
                };
            }),
        );

        return housesWithStats;
    }

    async getRoomStats() {
        const rooms = await this.prisma.room.findMany({
            include: {
                house: {
                    select: {
                        id: true,
                        address: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        monthlyPayments: true,
                    },
                },
            },
        });

        const roomsWithStats = await Promise.all(
            rooms.map(async (room) => {
                const [totalRevenue, unpaidCount] = await Promise.all([
                    this.prisma.monthlyPayment.aggregate({
                        where: {
                            roomId: room.id,
                            status: 'paid',
                        },
                        _sum: {
                            totalAmount: true,
                        },
                    }),
                    this.prisma.monthlyPayment.count({
                        where: {
                            roomId: room.id,
                            status: 'unpaid',
                        },
                    }),
                ]);

                return {
                    ...room,
                    area: Number(room.area),
                    roomPrice: Number(room.roomPrice),
                    electPrice: Number(room.electPrice),
                    waterPrice: Number(room.waterPrice),
                    trashFee: Number(room.trashFee),
                    washingMachineFee: Number(room.washingMachineFee),
                    elevatorFee: Number(room.elevatorFee),
                    deposit: Number(room.deposit),
                    totalPayments: room._count.monthlyPayments,
                    totalRevenue: totalRevenue._sum.totalAmount
                        ? Number(totalRevenue._sum.totalAmount)
                        : 0,
                    unpaidCount,
                };
            }),
        );

        return roomsWithStats;
    }
}