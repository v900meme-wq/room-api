import { IsString, IsOptional, IsInt, IsNumber, IsDateString } from 'class-validator';

export class UpdateRoomDto {
    @IsString()
    @IsOptional()
    roomName?: string;

    @IsString()
    @IsOptional()
    renter?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsNumber()
    @IsOptional()
    area?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber()
    @IsOptional()
    roomPrice?: number;

    @IsNumber()
    @IsOptional()
    electPrice?: number;

    @IsNumber()
    @IsOptional()
    waterPrice?: number;

    @IsNumber()
    @IsOptional()
    trashFee?: number;

    @IsNumber()
    @IsOptional()
    parkingFee?: number;

    @IsNumber()
    @IsOptional()
    washingMachineFee?: number;

    @IsNumber()
    @IsOptional()
    elevatorFee?: number;

    @IsDateString()
    @IsOptional()
    rentedAt?: string;

    @IsNumber()
    @IsOptional()
    deposit?: number;

    @IsString()
    @IsOptional()
    note?: string;

    @IsInt()
    @IsOptional()
    houseId?: number;
}
