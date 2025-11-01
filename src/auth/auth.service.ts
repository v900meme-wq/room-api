import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if username exists
        const existingUser = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashedPassword,
                phone: dto.phone,
                roomLimit: dto.roomLimit,
                isAdmin: dto.isAdmin || false,
            },
            select: {
                id: true,
                username: true,
                phone: true,
                roomLimit: true,
                isAdmin: true,
                status: true,
                createdAt: true,
            },
        });

        return {
            message: 'User registered successfully',
            user,
        };
    }

    async login(dto: LoginDto) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.status) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const payload = {
            sub: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                phone: user.phone,
                roomLimit: user.roomLimit,
                isAdmin: user.isAdmin,
            },
        };
    }

    async validateUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                phone: true,
                roomLimit: true,
                isAdmin: true,
                status: true,
            },
        });

        if (!user || !user.status) {
            return null;
        }

        return user;
    }
}