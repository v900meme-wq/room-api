import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService) { }

    private calculateTotalAmount(
        electStart: number,
        electEnd: number,
        waterStart: number,
        waterEnd: number,
        roomPrice: Decimal,
        electPrice: Decimal,
        waterPrice: Decimal,
        trashFee: Decimal,
        washingMachineFee: Decimal,
        elevatorFee: Decimal,
        parkingFee: Decimal,
    ): number {
        const electUsage = electEnd - electStart;
        const waterUsage = waterEnd - waterStart;

        if (electUsage < 0) { // Electric end must be greater than or equal to electric start
            throw new BadRequestException('Số điện mới phải lớn hơn hoặc bằng số điện cũ');
        }

        if (waterUsage < 0) { // Water end must be greater than or equal to water start
            throw new BadRequestException('Số nước mới phải lớn hơn hoặc bằng số nước cũ');
        }

        const total =
            Number(roomPrice) +
            electUsage * Number(electPrice) +
            waterUsage * Number(waterPrice) +
            Number(trashFee) +
            Number(washingMachineFee) +
            Number(elevatorFee) +
            Number(parkingFee);

        return total;
    }

    async create(dto: CreatePaymentDto, currentUser: any) {
        // Check if room exists
        const room = await this.prisma.room.findUnique({
            where: { id: dto.roomId },
            include: {
                house: true,
            },
        });

        if (!room) {
            throw new NotFoundException('Không tìm thấy phòng');
        }

        // Non-admin users can only create payments for rooms in their own houses
        if (!currentUser.isAdmin && room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể tạo hóa đơn cho phòng của bạn');
        }
        // if (room.house.userId !== currentUser.id) {
        //     throw new ForbiddenException('You can only create payments for rooms in your own houses');
        // }

        // Check if payment already exists for this room/month/year
        const existingPayment = await this.prisma.monthlyPayment.findUnique({
            where: {
                roomId_month_year: {
                    roomId: dto.roomId,
                    month: dto.month,
                    year: dto.year,
                },
            },
        });

        if (existingPayment) {
            throw new ConflictException( // Payment for room ${room.roomName} in ${dto.month}/${dto.year} already exists
                `Hóa đơn phòng ${room.roomName} của tháng ${dto.month}/${dto.year} đã tồn tại`,
            );
        }

        // Calculate total amount
        const totalAmount = this.calculateTotalAmount(
            dto.electStart,
            dto.electEnd,
            dto.waterStart,
            dto.waterEnd,
            room.roomPrice,
            room.electPrice,
            room.waterPrice,
            room.trashFee,
            room.washingMachineFee,
            room.elevatorFee,
            room.parkingFee ?? new Decimal(0),
        );

        const payment = await this.prisma.monthlyPayment.create({
            data: {
                ...dto,
                roomPrice: room.roomPrice,
                electPrice: room.electPrice,
                waterPrice: room.waterPrice,
                trashFee: room.trashFee,
                washingMachineFee: room.washingMachineFee,
                elevatorFee: room.elevatorFee,
                parkingFee: room.parkingFee,
                totalAmount,
            },
            include: {
                room: {
                    select: {
                        id: true,
                        roomName: true,
                        renter: true,
                        roomPrice: true,
                        house: {
                            select: {
                                id: true,
                                address: true,
                            },
                        },
                    },
                },
            },
        });

        // Convert Decimal to number
        return {
            ...payment,
            totalAmount: Number(payment.totalAmount),
            room: {
                ...payment.room,
                roomPrice: Number(payment.room.roomPrice),
            },
        };
    }

    async findAll(currentUser: any, roomId?: number, month?: number, year?: number, status?: string) {
        const where: any = {};

        // Filter by roomId if provided
        if (roomId) {
            // Check if user has access to this room
            if (!currentUser.isAdmin) {
                const room = await this.prisma.room.findFirst({
                    where: {
                        id: roomId,
                        house: {
                            userId: currentUser.id,
                        },
                    },
                });

                if (!room) { // You can only view payments for rooms in your own houses
                    throw new ForbiddenException('Bạn chỉ có thể xem hóa đơn ');
                }
            }

            where.roomId = roomId;
        } else {
            // Non-admin users can only see payments for their own rooms
            if (!currentUser.isAdmin) {
                where.room = {
                    house: {
                        userId: currentUser.id,
                    },
                };
            }
        }

        // Filter by month if provided
        if (month) {
            where.month = month;
        }

        // Filter by year if provided
        if (year) {
            where.year = year;
        }

        // Filter by status if provided
        if (status) {
            where.status = status;
        }

        const payments = await this.prisma.monthlyPayment.findMany({
            where,
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
            orderBy: [{ year: 'desc' }, { month: 'desc' }, { id: 'desc' }],
        });

        // Convert Decimal to number
        return payments.map((payment) => ({
            ...payment,
            totalAmount: Number(payment.totalAmount),
        }));
    }

    async getRecentPaymentsByRoom(roomId: number, currentUser: any) {
        // Check if room exists and user has access
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: {
                house: true,
            },
        });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        // Non-admin users can only view payments for rooms in their own houses
        if (!currentUser.isAdmin && room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể xem hóa đơn của bạn');
        } // You can only view payments for rooms in your own houses

        // Get 5 most recent payments
        const payments = await this.prisma.monthlyPayment.findMany({
            where: { roomId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            take: 5,
            select: {
                id: true,
                month: true,
                year: true,
                electStart: true,
                electEnd: true,
                waterStart: true,
                waterEnd: true,
                totalAmount: true,
                status: true,
                createdAt: true,
            },
        });

        // Convert Decimal to number and add suggestion for next payment
        const paymentsWithNumbers = payments.map((payment) => ({
            ...payment,
            totalAmount: Number(payment.totalAmount),
        }));

        // If there are previous payments, suggest start values for next payment
        let suggestion: {
            suggestedElectStart: number;
            suggestedWaterStart: number;
            lastPaymentMonth: number;
            lastPaymentYear: number;
        } | null = null;

        if (paymentsWithNumbers.length > 0) {
            const latestPayment = paymentsWithNumbers[0];
            suggestion = {
                suggestedElectStart: latestPayment.electEnd,
                suggestedWaterStart: latestPayment.waterEnd,
                lastPaymentMonth: latestPayment.month,
                lastPaymentYear: latestPayment.year,
            };
        }

        return {
            recentPayments: paymentsWithNumbers,
            suggestion,
        };
    }

    async findOne(id: number, currentUser: any) {
        const payment = await this.prisma.monthlyPayment.findUnique({
            where: { id },
            include: {
                room: {
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
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        // Non-admin users can only view payments for rooms in their own houses
        if (!currentUser.isAdmin && payment.room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể xem hóa đơn của bạn');
        } // You can only view payments for rooms in your own houses

        // Convert Decimal to number
        return {
            ...payment,
            totalAmount: Number(payment.totalAmount),
            room: {
                ...payment.room,
                area: Number(payment.room.area),
                roomPrice: Number(payment.room.roomPrice),
                electPrice: Number(payment.room.electPrice),
                waterPrice: Number(payment.room.waterPrice),
                trashFee: Number(payment.room.trashFee),
                washingMachineFee: Number(payment.room.washingMachineFee),
                elevatorFee: Number(payment.room.elevatorFee),
                deposit: Number(payment.room.deposit),
            },
        };
    }

    async update(id: number, dto: UpdatePaymentDto, currentUser: any) {
        const payment = await this.prisma.monthlyPayment.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        house: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('Không tìm thấy hóa đơn');
        }

        // Non-admin users can only update payments for rooms in their own houses
        if (!currentUser.isAdmin && payment.room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể cập nhật hóa đơn của bạn');
        } // You can only update payments for rooms in your own houses

        // If month or year is changed, check for conflicts
        if ((dto.month && dto.month !== payment.month) || (dto.year && dto.year !== payment.year)) {
            const newMonth = dto.month || payment.month;
            const newYear = dto.year || payment.year;

            const existingPayment = await this.prisma.monthlyPayment.findUnique({
                where: {
                    roomId_month_year: {
                        roomId: payment.roomId,
                        month: newMonth,
                        year: newYear,
                    },
                },
            });

            if (existingPayment && existingPayment.id !== id) {
                throw new ConflictException(
                    `Payment for room ${payment.room.roomName} in ${newMonth}/${newYear} already exists`,
                );
            }
        }

        // Recalculate total amount if any relevant field changed
        let totalAmount = Number(payment.totalAmount);

        if (
            dto.electStart !== undefined ||
            dto.electEnd !== undefined ||
            dto.waterStart !== undefined ||
            dto.waterEnd !== undefined
        ) {
            totalAmount = this.calculateTotalAmount(
                dto.electStart ?? payment.electStart,
                dto.electEnd ?? payment.electEnd,
                dto.waterStart ?? payment.waterStart,
                dto.waterEnd ?? payment.waterEnd,
                payment.room.roomPrice,
                payment.room.electPrice,
                payment.room.waterPrice,
                payment.room.trashFee,
                payment.room.parkingFee ?? Decimal(0),
                payment.room.washingMachineFee,
                payment.room.elevatorFee,
            );
        }

        const updatedPayment = await this.prisma.monthlyPayment.update({
            where: { id },
            data: {
                ...dto,
                totalAmount,
            },
            include: {
                room: {
                    select: {
                        id: true,
                        roomName: true,
                        renter: true,
                        roomPrice: true,
                        house: {
                            select: {
                                id: true,
                                address: true,
                            },
                        },
                    },
                },
            },
        });

        // Convert Decimal to number
        return {
            ...updatedPayment,
            totalAmount: Number(updatedPayment.totalAmount),
            room: {
                ...updatedPayment.room,
                roomPrice: Number(updatedPayment.room.roomPrice),
            },
        };
    }

    async remove(id: number, currentUser: any) {
        const payment = await this.prisma.monthlyPayment.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        house: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('Không tìm thấy hóa đơn');
        }

        // Non-admin users can only delete payments for rooms in their own houses
        if (!currentUser.isAdmin && payment.room.house.userId !== currentUser.id) {
            throw new ForbiddenException('Bạn chỉ có thể xóa hóa đơn của bạn');
        } // You can only delete payments for rooms in your own houses

        await this.prisma.monthlyPayment.delete({ where: { id } });

        return { message: 'Xóa hóa đơn thành công' }; // Payment deleted successfully
    }
}