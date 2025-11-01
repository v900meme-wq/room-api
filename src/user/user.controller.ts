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
    ForbiddenException,
    Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuditLog } from 'src/common/decorators/audit-log.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @UseGuards(AdminGuard)
    @AuditLog('CREATE', 'USER')
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @UseGuards(AdminGuard)
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        // User thường chỉ xem được thông tin của chính mình
        // Admin xem được tất cả
        if (!req.user.isAdmin && req.user.id !== id) {
            throw new ForbiddenException('You can only view your own information');
        }
        return this.userService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    @AuditLog('UPDATE', 'USER')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    @AuditLog('DELETE', 'USER')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}