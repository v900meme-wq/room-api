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
} from '@nestjs/common';
import { PriceService } from './price.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@Controller('prices')
@UseGuards(JwtAuthGuard)
export class PriceController {
    constructor(private readonly priceService: PriceService) { }

    @Post()
    @AuditLog('CREATE', 'PRICE')
    create(@Body() createPriceDto: CreatePriceDto, @Request() req) {
        return this.priceService.create(createPriceDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.priceService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.priceService.findOne(id, req.user);
    }

    @Patch(':id')
    @AuditLog('UPDATE', 'PRICE')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePriceDto: UpdatePriceDto,
        @Request() req,
    ) {
        return this.priceService.update(id, updatePriceDto, req.user);
    }

    @Delete(':id')
    @AuditLog('DELETE', 'PRICE')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.priceService.remove(id, req.user);
    }
}