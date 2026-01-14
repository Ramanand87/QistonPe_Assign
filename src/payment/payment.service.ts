import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createPaymentDto: CreatePaymentDto) {
        const { poId, amount, paymentMethod, notes } = createPaymentDto;

        // @ts-ignore
        return this.prisma.$transaction(async (tx) => {
            // 1. Get PO
            // @ts-ignore
            const po = await tx.purchaseOrder.findUnique({
                where: { id: poId },
                include: { payments: true }
            });
            if (!po) throw new NotFoundException('Purchase Order not found');

            // 2. Validate Amount
            const totalPaid = po.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const outstanding = Number(po.totalAmount) - totalPaid;

            if (Number(amount) > outstanding) {
                throw new BadRequestException(`Payment amount (${amount}) exceeds outstanding balance (${outstanding})`);
            }

            // 3. Generate Ref
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            // @ts-ignore
            const count = await tx.payment.count({
                where: { paymentRef: { startsWith: `PAY-${dateStr}` } }
            });
            const paymentRef = `PAY-${dateStr}-${String(count + 1).padStart(3, '0')}`;

            // 4. Create Payment
            // @ts-ignore
            const payment = await tx.payment.create({
                data: {
                    paymentRef,
                    poId,
                    date: new Date(),
                    amount,
                    method: paymentMethod,
                    notes,
                },
            });

            // 5. Update PO Status
            const newTotalPaid = totalPaid + Number(amount);
            const newStatus = (newTotalPaid >= Number(po.totalAmount)) ? 'FULLY_PAID' : 'PARTIALLY_PAID';

            // @ts-ignore
            await tx.purchaseOrder.update({
                where: { id: poId },
                data: { status: newStatus },
            });

            return payment;
        });
    }

    async findAll() {
        // @ts-ignore
        return this.prisma.payment.findMany({
            include: { purchaseOrder: true }
        });
    }

    async findOne(id: string) {
        // @ts-ignore
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { purchaseOrder: true },
        });
        if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
        return payment;
    }
}
