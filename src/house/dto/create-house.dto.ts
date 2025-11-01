import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateHouseDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    note: string;

    @IsInt()
    @IsNotEmpty()
    userId: number;
}