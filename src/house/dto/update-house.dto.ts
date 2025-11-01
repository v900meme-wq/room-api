import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateHouseDto {
    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    note?: string;

    @IsInt()
    @IsOptional()
    userId?: number;
}