import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto, POStatus } from './dto/update-purchase-order-status.dto';

@Injectable()
export class PurchaseOrderService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
        const { vendorId, items, date } = createPurchaseOrderDto;

        // 1. Validate Vendor
        // @ts-ignore
        const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
        if (!vendor) throw new NotFoundException('Vendor not found');
        if (vendor.status === 'INACTIVE') throw new BadRequestException('Cannot create PO for inactive vendor');

        // 2. Calculate Total Amount
        const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

        // 3. Calculate Due Date
        const poDate = new Date(date);
        const dueDate = new Date(poDate);
        // @ts-ignore
        dueDate.setDate(dueDate.getDate() + vendor.paymentTerms);

        // 4. Generate PO Number
        const dateStr = poDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        // @ts-ignore
        const latestPO = await this.prisma.purchaseOrder.findFirst({
            where: { poNumber: { startsWith: `PO-${dateStr}` } },
            orderBy: { poNumber: 'desc' },
        });

        let sequence = 1;
        if (latestPO) {
            const parts = latestPO.poNumber.split('-');
            const lastSeq = parseInt(parts[2]);
            if (!isNaN(lastSeq)) sequence = lastSeq + 1;
        }

        const poNumber = `PO-${dateStr}-${String(sequence).padStart(3, '0')}`;

        // 5. Create PO
        // @ts-ignore
        return this.prisma.purchaseOrder.create({
            data: {
                poNumber,
                vendorId,
                date: poDate,
                totalAmount,
                paymentDueDate: dueDate,
                status: 'DRAFT',
                items: items as any,
            },
            include: { vendor: true },
        });
    }

    async findAll(vendorId?: string, status?: POStatus) {
        const where: any = {};
        if (vendorId) where.vendorId = vendorId;
        if (status) where.status = status;

        // @ts-ignore
        return this.prisma.purchaseOrder.findMany({
            where,
            include: { vendor: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        // @ts-ignore
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                vendor: true,
                payments: true // "Get PO details with payment history"
            },
        });
        if (!po) throw new NotFoundException(`Purchase Order with ID ${id} not found`);
        return po;
    }

    async updateStatus(id: string, updateDto: UpdatePurchaseOrderStatusDto) {
        await this.findOne(id);
        // @ts-ignore
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: { status: updateDto.status }
        });
    }
}
