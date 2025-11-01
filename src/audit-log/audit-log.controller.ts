import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    async findAll(
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('entity') entity?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.auditLogService.findAll({
            userId: userId ? parseInt(userId, 10) : undefined,
            action,
            entity,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        });
    }

    @Get('entity')
    async findByEntity(
        @Query('entity') entity: string,
        @Query('entityId', ParseIntPipe) entityId: number,
    ) {
        return this.auditLogService.findByEntity(entity, entityId);
    }
}
