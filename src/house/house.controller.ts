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
import { HouseService } from './house.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from 'src/common/decorators/audit-log.decorator';

@Controller('houses')
@UseGuards(JwtAuthGuard)
export class HouseController {
    constructor(private readonly houseService: HouseService) { }

    @Post()
    @AuditLog('CREATE', 'HOUSE')
    create(@Body() createHouseDto: CreateHouseDto, @Request() req) {
        return this.houseService.create(createHouseDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.houseService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.houseService.findOne(id, req.user);
    }

    @Patch(':id')
    @AuditLog('UPDATE', 'HOUSE')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateHouseDto: UpdateHouseDto,
        @Request() req,
    ) {
        return this.houseService.update(id, updateHouseDto, req.user);
    }

    @Delete(':id')
    @AuditLog('DELETE', 'HOUSE')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.houseService.remove(id, req.user);
    }
}