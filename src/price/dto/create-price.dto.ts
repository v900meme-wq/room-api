import { IsString, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class CreatePriceDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    priceName: string;

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
    washingMachineFee: number;

    @IsNumber()
    @IsNotEmpty()
    elevatorFee: number;

    @IsNumber()
    @IsNotEmpty()
    deposit: number;
}