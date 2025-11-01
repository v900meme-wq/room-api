import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        // Check if username exists
        const existingUser = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...dto,
                password: hashedPassword,
            },
            select: {
                id: true,
                username: true,
                phone: true,
                roomLimit: true,
                isAdmin: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                phone: true,
                roomLimit: true,
                isAdmin: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { houses: true },
                },
            },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                phone: true,
                roomLimit: true,
                isAdmin: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                houses: {
                    select: {
                        id: true,
                        address: true,
                        _count: {
                            select: { rooms: true },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: number, dto: UpdateUserDto) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // If updating username, check if it's already taken
        if (dto.username && dto.username !== user.username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username: dto.username },
            });
            if (existingUser) {
                throw new ConflictException('Username already exists');
            }
        }

        // Hash password if provided
        const updateData: any = { ...dto };
        if (dto.password) {
            updateData.password = await bcrypt.hash(dto.password, 10);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                phone: true,
                roomLimit: true,
                isAdmin: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return updatedUser;
    }

    async remove(id: number) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user has houses
        const housesCount = await this.prisma.house.count({
            where: { userId: id },
        });

        if (housesCount > 0) {
            throw new ConflictException(
                'Cannot delete user with existing houses. Please delete all houses first.',
            );
        }

        await this.prisma.user.delete({ where: { id } });

        return { message: 'User deleted successfully' };
    }
}