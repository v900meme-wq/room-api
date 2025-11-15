import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateRoomDto, currentUser: any) {
        // Check if house exists
        const house = await this.prisma.house.findUnique({
            where: { id: dto.houseId },
            include: {
                user: true,
            },
        });

        if (!house) {
            throw new NotFoundException('House not found');
        }

        // Non-admin users can only create rooms in their own houses
        // if (!currentUser.isAdmin && house.userId !== currentUser.id) {
        //     throw new ForbiddenException('You can only create rooms in your own houses');
        // }
        if (house.userId !== currentUser.id) {
            throw new ForbiddenException('You can only create rooms in your own houses');
        }

        // Check room limit
        if (house.user.roomLimit !== null) {
            const currentRoomsCount = await this.prisma.room.count({
                where: {
                    house: {
                        userId: house.userId,
                    },
                },
            });

            if (currentRoomsCount >= house.user.roomLimit) {
                throw new BadRequestException(
                    `User has reached the maximum number of rooms (${house.user.roomLimit})`,
                );
            }
        }

        const room = await this.prisma.room.create({
            data: dto,
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
            },
        });

        return room;
    }

    async findAll(currentUser: any, houseId: number) {
        const house = await this.prisma.house.findFirst({
            where: {
                id: houseId,
                userId: currentUser.id,
            },
        });

        if (!house) {
            throw new ForbiddenException('You can only view rooms in your own houses');
        }

        const where = {
            houseId,
        };

        const rooms = await this.prisma.room.findMany({
            where,
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
                    select: { monthlyPayments: true },
                },
            },
            orderBy: { id: 'desc' },
        });

        // Convert Decimal to number
        return rooms.map((room) => ({
            ...room,
            area: Number(room.area),
            roomPrice: Number(room.roomPrice),
            electPrice: Number(room.electPrice),
            waterPrice: Number(room.waterPrice),
            trashFee: Number(room.trashFee),
            parkingFee: Number(room.parkingFee),
            washingMachineFee: Number(room.washingMachineFee),
            elevatorFee: Number(room.elevatorFee),
            deposit: Number(room.deposit),
        }));
    }

    async findAllByUser(currentUser: any) {
        // Lấy tất cả house của user
        const houses = await this.prisma.house.findMany({
            where: { userId: currentUser.id },
            select: { id: true },
        });

        const houseIds = houses.map(h => h.id);

        if (houseIds.length === 0) {
            return [];
        }

        const rooms = await this.prisma.room.findMany({
            where: {
                houseId: { in: houseIds },
            },
            include: {
                house: {
                    select: {
                        id: true,
                        address: true,
                    },
                },
                _count: {
                    select: { monthlyPayments: true },
                },
            },
            orderBy: { id: 'desc' },
        });

        return rooms.map(room => ({
            ...room,
            area: Number(room.area),
            roomPrice: Number(room.roomPrice),
            electPrice: Number(room.electPrice),
            waterPrice: Number(room.waterPrice),
            trashFee: Number(room.trashFee),
            washingMachineFee: Number(room.washingMachineFee),
            elevatorFee: Number(room.elevatorFee),
            deposit: Number(room.deposit),
        }));
    }


    async findOne(id: number, currentUser: any) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                house: {
                    select: {
                        id: true,
                        address: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                phone: true,
                            },
                        },
                    },
                },
                monthlyPayments: {
                    select: {
                        id: true,
                        month: true,
                        year: true,
                        totalAmount: true,
                        status: true,
                        createdAt: true,
                    },
                    orderBy: [{ year: 'desc' }, { month: 'desc' }],
                    take: 6,
                },
            },
        });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        // Non-admin users can only view rooms in their own houses
        // if (!currentUser.isAdmin && room.house.userId !== currentUser.id) {
        //     throw new ForbiddenException('You can only view rooms in your own houses');
        // }
        if (room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể xem phòng của nhà bạn');
        }

        // Convert Decimal to number
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
            monthlyPayments: room.monthlyPayments.map((p) => ({
                ...p,
                totalAmount: Number(p.totalAmount),
            })),
        };
    }

    async update(id: number, dto: UpdateRoomDto, currentUser: any) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                house: true,
            },
        });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        // Non-admin users can only update rooms in their own houses
        // if (!currentUser.isAdmin && room.house.userId !== currentUser.id) {
        //     throw new ForbiddenException('You can only update rooms in your own houses');
        // }
        if (room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể cập nhật phòng của nhà bạn');
        }

        // If changing houseId, check new house
        if (dto.houseId && dto.houseId !== room.houseId) {
            const newHouse = await this.prisma.house.findUnique({
                where: { id: dto.houseId },
                include: { user: true },
            });

            if (!newHouse) {
                throw new NotFoundException('New house not found');
            }

            // Non-admin can only move to their own houses
            // if (!currentUser.isAdmin && newHouse.userId !== currentUser.id) {
            //     throw new ForbiddenException('You can only move rooms to your own houses');
            // }
            if (newHouse.userId !== currentUser.id) {
                throw new ForbiddenException('Bạn chỉ có thể di chuyển phòng tới nhà khác của bạn');
            }

            // Check room limit for new house's user
            if (newHouse.user.roomLimit !== null && newHouse.userId !== room.house.userId) {
                const newUserRoomsCount = await this.prisma.room.count({
                    where: {
                        house: {
                            userId: newHouse.userId,
                        },
                    },
                });

                if (newUserRoomsCount >= newHouse.user.roomLimit) {
                    throw new BadRequestException(
                        `Bạn đã đạt đến số lượng phòng tối đa (${newHouse.user.roomLimit})`,
                    );
                }
            }
        }

        const updatedRoom = await this.prisma.room.update({
            where: { id },
            data: dto,
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
            },
        });

        return updatedRoom;
    }

    async remove(id: number, currentUser: any) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                house: true,
            },
        });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        // Non-admin users can only delete rooms in their own houses
        // if (!currentUser.isAdmin && room.house.userId !== currentUser.id) {
        //     throw new ForbiddenException('You can only delete rooms in your own houses');
        // }
        if (room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể xóa phòng của nhà bạn');
        }

        // Check if room has payments
        const paymentsCount = await this.prisma.monthlyPayment.count({
            where: { roomId: id },
        });

        if (paymentsCount > 0) {
            throw new BadRequestException(
                'Cannot delete room with existing payments. Please delete all payments first.',
            );
        }

        await this.prisma.room.delete({ where: { id } });

        return { message: 'Room deleted successfully' };
    }
}