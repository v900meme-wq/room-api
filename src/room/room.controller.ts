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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from 'src/common/decorators/audit-log.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Post()
    @AuditLog('CREATE', 'ROOM')
    create(@Body() createRoomDto: CreateRoomDto, @Request() req) {
        return this.roomService.create(createRoomDto, req.user);
    }

    @Get()
    findAll(@Request() req, @Query('houseId') houseId?: string) {
        const houseIdNum = houseId ? parseInt(houseId, 10) : undefined;
        return this.roomService.findAll(req.user, houseIdNum);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.roomService.findOne(id, req.user);
    }

    @Patch(':id')
    @AuditLog('UPDATE', 'ROOM')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoomDto: UpdateRoomDto,
        @Request() req,
    ) {
        return this.roomService.update(id, updateRoomDto, req.user);
    }

    @Delete(':id')
    @AuditLog('DELETE', 'ROOM')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.roomService.remove(id, req.user);
    }
}