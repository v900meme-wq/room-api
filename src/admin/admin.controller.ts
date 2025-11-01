import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    async getDashboard(@Query() query: DashboardQueryDto) {
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        return this.adminService.getDashboardStats(startDate, endDate);
    }

    @Get('users/stats')
    async getUserStats() {
        return this.adminService.getUserStats();
    }

    @Get('houses/stats')
    async getHouseStats() {
        return this.adminService.getHouseStats();
    }

    @Get('rooms/stats')
    async getRoomStats() {
        return this.adminService.getRoomStats();
    }
}
