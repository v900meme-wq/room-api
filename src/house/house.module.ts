import { Module } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseController } from './house.controller';

@Module({
    controllers: [HouseController],
    providers: [HouseService],
    exports: [HouseService],
})
export class HouseModule { }