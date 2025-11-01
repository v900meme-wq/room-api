import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
    userId?: number;
    username: string;
    action: string;
    entity: string;
    entityId?: number;
    oldValue?: any;
    newValue?: any;
    ipAddress: string;
    userAgent?: string;
}

@Injectable()
export class AuditLogService {
    constructor(private prisma: PrismaService) { }

    async create(data: AuditLogData) {
        return this.prisma.auditLog.create({
            data: {
                userId: data.userId,
                username: data.username,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
                newValue: data.newValue ? JSON.stringify(data.newValue) : null,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }

    async findAll(filters?: {
        userId?: number;
        action?: string;
        entity?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }) {
        const where: any = {};

        if (filters?.userId) where.userId = filters.userId;
        if (filters?.action) where.action = filters.action;
        if (filters?.entity) where.entity = filters.entity;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = filters.startDate;
            if (filters.endDate) where.createdAt.lte = filters.endDate;
        }

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: filters?.limit || 50,
                skip: filters?.offset || 0,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data: logs.map((log) => ({
                ...log,
                oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
                newValue: log.newValue ? JSON.parse(log.newValue) : null,
            })),
            total,
        };
    }

    async findByEntity(entity: string, entityId: number) {
        const logs = await this.prisma.auditLog.findMany({
            where: { entity, entityId },
            orderBy: { createdAt: 'desc' },
        });

        return logs.map((log) => ({
            ...log,
            oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
            newValue: log.newValue ? JSON.parse(log.newValue) : null,
        }));
    }
}