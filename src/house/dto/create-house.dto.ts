import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateHouseDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    note: string;

    @IsInt()
    @IsNotEmpty()
    userId: number;
}