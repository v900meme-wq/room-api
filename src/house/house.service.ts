import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Injectable()
export class HouseService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateHouseDto, currentUser: any) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Non-admin users can only create houses for themselves
        if (!currentUser.isAdmin && dto.userId !== currentUser.id) {
            throw new ForbiddenException('You can only create houses for yourself');
        }

        // Note: roomLimit will be checked when creating rooms, not houses
        // A user can have multiple houses, the limit applies to total rooms across all houses

        const house = await this.prisma.house.create({
            data: dto,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        phone: true,
                    },
                },
                _count: {
                    select: { rooms: true },
                },
            },
        });

        return house;
    }

    async findAll(currentUser: any) {
        // Admin sees all houses, regular users only see their own
        const where = currentUser.isAdmin ? {} : { userId: currentUser.id };

        return this.prisma.house.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        phone: true,
                    },
                },
                _count: {
                    select: { rooms: true },
                },
            },
            orderBy: { id: 'desc' },
        });
    }

    async findOne(id: number, currentUser: any) {
        const house = await this.prisma.house.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        phone: true,
                        roomLimit: true,
                    },
                },
                rooms: {
                    select: {
                        id: true,
                        roomName: true,
                        renter: true,
                        phone: true,
                        area: true,
                        status: true,
                        roomPrice: true,
                        rentedAt: true,
                    },
                    orderBy: { roomName: 'asc' },
                },
            },
        });

        if (!house) {
            throw new NotFoundException('House not found');
        }

        // Non-admin users can only view their own houses
        if (!currentUser.isAdmin && house.userId !== currentUser.id) {
            throw new ForbiddenException('You can only view your own houses');
        }

        return house;
    }

    async update(id: number, dto: UpdateHouseDto, currentUser: any) {
        const house = await this.prisma.house.findUnique({
            where: { id },
        });

        if (!house) {
            throw new NotFoundException('House not found');
        }

        // Non-admin users can only update their own houses
        if (!currentUser.isAdmin && house.userId !== currentUser.id) {
            throw new ForbiddenException('You can only update your own houses');
        }

        // If changing userId, check new user exists
        if (dto.userId && dto.userId !== house.userId) {
            const newUser = await this.prisma.user.findUnique({
                where: { id: dto.userId },
            });

            if (!newUser) {
                throw new NotFoundException('New user not found');
            }

            // Check new user's room limit
            if (newUser.roomLimit !== null) {
                const newUserHousesCount = await this.prisma.house.count({
                    where: { userId: dto.userId },
                });

                if (newUserHousesCount >= newUser.roomLimit) {
                    throw new BadRequestException(
                        `Target user has reached the maximum number of houses (${newUser.roomLimit})`,
                    );
                }
            }
        }

        const updatedHouse = await this.prisma.house.update({
            where: { id },
            data: dto,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        phone: true,
                    },
                },
                _count: {
                    select: { rooms: true },
                },
            },
        });

        return updatedHouse;
    }

    async remove(id: number, currentUser: any) {
        const house = await this.prisma.house.findUnique({
            where: { id },
        });

        if (!house) {
            throw new NotFoundException('House not found');
        }

        // Non-admin users can only delete their own houses
        if (!currentUser.isAdmin && house.userId !== currentUser.id) {
            throw new ForbiddenException('You can only delete your own houses');
        }

        // Check if house has rooms
        const roomsCount = await this.prisma.room.count({
            where: { houseId: id },
        });

        if (roomsCount > 0) {
            throw new BadRequestException(
                'Cannot delete house with existing rooms. Please delete all rooms first.',
            );
        }

        await this.prisma.house.delete({ where: { id } });

        return { message: 'House deleted successfully' };
    }
}