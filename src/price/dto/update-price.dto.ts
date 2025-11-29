import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class UpdatePriceDto {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    priceName?: string;

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
    washingMachineFee?: number;

    @IsNumber()
    @IsOptional()
    elevatorFee?: number;

    @IsNumber()
    @IsOptional()
    deposit?: number;
}