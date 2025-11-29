import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';

@Injectable()
export class PriceService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreatePriceDto, currentUser: any) {

        const price = await this.prisma.price.create({
            data: {
                priceName: dto.priceName,
                roomPrice: dto.roomPrice,
                electPrice: dto.electPrice,
                waterPrice: dto.waterPrice,
                trashFee: dto.trashFee,
                washingMachineFee: dto.washingMachineFee,
                elevatorFee: dto.elevatorFee,
                deposit: dto.deposit,
            },
        });

        return {
            ...price,
            roomPrice: Number(price.roomPrice),
            electPrice: Number(price.electPrice),
            waterPrice: Number(price.waterPrice),
            trashFee: Number(price.trashFee),
            washingMachineFee: Number(price.washingMachineFee),
            elevatorFee: Number(price.elevatorFee),
            deposit: Number(price.deposit),
        };
    }

    async findAll(currentUser: any) {
        // Tất cả user đã login đều có thể xem danh sách price templates
        const prices = await this.prisma.price.findMany({
            orderBy: { id: 'desc' },
        });

        return prices.map((price) => ({
            ...price,
            roomPrice: Number(price.roomPrice),
            electPrice: Number(price.electPrice),
            waterPrice: Number(price.waterPrice),
            trashFee: Number(price.trashFee),
            washingMachineFee: Number(price.washingMachineFee),
            elevatorFee: Number(price.elevatorFee),
            deposit: Number(price.deposit),
        }));
    }

    async findOne(id: number, currentUser: any) {
        const price = await this.prisma.price.findUnique({
            where: { id },
        });

        if (!price) {
            throw new NotFoundException('Price template not found');
        }

        return {
            ...price,
            roomPrice: Number(price.roomPrice),
            electPrice: Number(price.electPrice),
            waterPrice: Number(price.waterPrice),
            trashFee: Number(price.trashFee),
            washingMachineFee: Number(price.washingMachineFee),
            elevatorFee: Number(price.elevatorFee),
            deposit: Number(price.deposit),
        };
    }

    async update(id: number, dto: UpdatePriceDto, currentUser: any) {

        const price = await this.prisma.price.findUnique({
            where: { id },
        });

        if (!price) {
            throw new NotFoundException('Price template not found');
        }

        const updatedPrice = await this.prisma.price.update({
            where: { id },
            data: dto,
        });

        return {
            ...updatedPrice,
            roomPrice: Number(updatedPrice.roomPrice),
            electPrice: Number(updatedPrice.electPrice),
            waterPrice: Number(updatedPrice.waterPrice),
            trashFee: Number(updatedPrice.trashFee),
            washingMachineFee: Number(updatedPrice.washingMachineFee),
            elevatorFee: Number(updatedPrice.elevatorFee),
            deposit: Number(updatedPrice.deposit),
        };
    }

    async remove(id: number, currentUser: any) {

        const price = await this.prisma.price.findUnique({
            where: { id },
        });

        if (!price) {
            throw new NotFoundException('Price template not found');
        }

        await this.prisma.price.delete({ where: { id } });

        return { message: 'Price template deleted successfully' };
    }
}