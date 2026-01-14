import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createVendorDto: CreateVendorDto) {
        // Check uniqueness
        const existing = await this.prisma.vendor.findFirst({
            where: {
                OR: [
                    { email: createVendorDto.email },
                    { name: createVendorDto.name }
                ]
            }
        });
        if (existing) {
            throw new ConflictException('Vendor with this email or name already exists');
        }

        return this.prisma.vendor.create({
            data: createVendorDto,
        });
    }

    async findAll() {
        return this.prisma.vendor.findMany();
    }

    async findOne(id: string) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id },
            include: {
                purchaseOrders: {
                    include: { payments: true }
                }
            }
        });
        if (!vendor) throw new NotFoundException(`Vendor with ID ${id} not found`);

        // Calculate payment summary
        let totalPoAmount = 0;
        let totalPaid = 0;

        vendor.purchaseOrders.forEach((po: any) => {
            totalPoAmount += Number(po.totalAmount);
            po.payments.forEach((p: any) => {
                totalPaid += Number(p.amount);
            });
        });

        return {
            ...vendor,
            paymentSummary: {
                totalPurchaseOrders: vendor.purchaseOrders.length,
                totalPoAmount,
                totalPaid,
                outstandingBalance: totalPoAmount - totalPaid,
            }
        };
    }

    async update(id: string, updateVendorDto: UpdateVendorDto) {
        // check existence
        await this.findOne(id);

        return this.prisma.vendor.update({
            where: { id },
            data: updateVendorDto,
        });
    }
}
