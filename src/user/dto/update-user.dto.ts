import { IsString, IsOptional, MinLength, MaxLength, IsBoolean, IsInt } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    username?: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    phone?: string;

    @IsInt()
    @IsOptional()
    roomLimit?: number;

    @IsBoolean()
    @IsOptional()
    isAdmin?: boolean;

    @IsBoolean()
    @IsOptional()
    status?: boolean;
}