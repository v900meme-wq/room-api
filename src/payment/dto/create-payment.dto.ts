import { IsInt, IsNotEmpty, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
    @IsInt()
    @IsNotEmpty()
    electStart: number;

    @IsInt()
    @IsNotEmpty()
    electEnd: number;

    @IsInt()
    @IsNotEmpty()
    waterStart: number;

    @IsInt()
    @IsNotEmpty()
    waterEnd: number;

    @IsInt()
    @Min(1)
    @Max(12)
    @IsNotEmpty()
    month: number;

    @IsInt()
    @Min(2000)
    @Max(2100)
    @IsNotEmpty()
    year: number;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsString()
    @IsOptional()
    note: string;

    @IsInt()
    @IsNotEmpty()
    roomId: number;
}