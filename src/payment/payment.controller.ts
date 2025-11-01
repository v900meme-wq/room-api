import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from 'src/common/decorators/audit-log.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post()
    @AuditLog('CREATE', 'PAYMENT')
    create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
        return this.paymentService.create(createPaymentDto, req.user);
    }

    @Get()
    findAll(
        @Request() req,
        @Query('roomId') roomId?: string,
        @Query('month') month?: string,
        @Query('year') year?: string,
        @Query('status') status?: string,
    ) {
        const roomIdNum = roomId ? parseInt(roomId, 10) : undefined;
        const monthNum = month ? parseInt(month, 10) : undefined;
        const yearNum = year ? parseInt(year, 10) : undefined;

        return this.paymentService.findAll(req.user, roomIdNum, monthNum, yearNum, status);
    }

    @Get('room/:roomId/recent')
    getRecentPayments(@Param('roomId', ParseIntPipe) roomId: number, @Request() req) {
        return this.paymentService.getRecentPaymentsByRoom(roomId, req.user);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.paymentService.findOne(id, req.user);
    }

    @Patch(':id')
    @AuditLog('UPDATE', 'PAYMENT')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePaymentDto: UpdatePaymentDto,
        @Request() req,
    ) {
        return this.paymentService.update(id, updatePaymentDto, req.user);
    }

    @Delete(':id')
    @AuditLog('DELETE', 'PAYMENT')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.paymentService.remove(id, req.user);
    }
}