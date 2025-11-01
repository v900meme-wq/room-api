import { IsInt, IsOptional, Min, Max, IsString } from 'class-validator';

export class UpdatePaymentDto {
    @IsInt()
    @IsOptional()
    electStart?: number;

    @IsInt()
    @IsOptional()
    electEnd?: number;

    @IsInt()
    @IsOptional()
    waterStart?: number;

    @IsInt()
    @IsOptional()
    waterEnd?: number;

    @IsInt()
    @Min(1)
    @Max(12)
    @IsOptional()
    month?: number;

    @IsInt()
    @Min(2000)
    @Max(2100)
    @IsOptional()
    year?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    note?: string;
}