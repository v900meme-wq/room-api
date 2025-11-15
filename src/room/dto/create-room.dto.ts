import { IsString, IsNotEmpty, IsInt, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    roomName: string;

    @IsString()
    @IsNotEmpty()
    renter: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsNumber()
    @IsNotEmpty()
    area: number;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsNumber()
    @IsNotEmpty()
    roomPrice: number;

    @IsNumber()
    @IsNotEmpty()
    electPrice: number;

    @IsNumber()
    @IsNotEmpty()
    waterPrice: number;

    @IsNumber()
    @IsNotEmpty()
    trashFee: number;

    @IsNumber()
    @IsNotEmpty()
    parkingFee: number;

    @IsNumber()
    @IsNotEmpty()
    washingMachineFee: number;

    @IsNumber()
    @IsNotEmpty()
    elevatorFee: number;

    @IsDateString()
    @IsNotEmpty()
    rentedAt: string;

    @IsNumber()
    @IsNotEmpty()
    deposit: number;

    @IsString()
    @IsOptional()
    note: string;

    @IsInt()
    @IsNotEmpty()
    houseId: number;
}