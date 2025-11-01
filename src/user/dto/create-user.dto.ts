import { IsString, IsNotEmpty, MinLength, MaxLength, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    phone: string;

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
