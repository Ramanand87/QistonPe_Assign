import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface VendorWithPOs {
    id: string;
    name: string;
    purchaseOrders: Array<{
        totalAmount: any;
        payments: Array<{ amount: any }>;
    }>;
}

interface POWithPayments {
    id: string;
    totalAmount: any;
    paymentDueDate: Date;
    payments: Array<{ amount: any }>;
}

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getVendorOutstanding() {
        const vendors = await this.prisma.vendor.findMany({
            include: {
                purchaseOrders: {
                    include: { payments: true },
                },
            },
        }) as VendorWithPOs[];

        return vendors.map(v => {
            let totalAmount = 0;
            let totalPaid = 0;

            v.purchaseOrders.forEach(po => {
                totalAmount += Number(po.totalAmount);
                po.payments.forEach(p => {
                    totalPaid += Number(p.amount);
                });
            });

            return {
                vendorId: v.id,
                vendorName: v.name,
                totalPoAmount: totalAmount,
                totalPaid: totalPaid,
                outstandingBalance: totalAmount - totalPaid,
            };
        });
    }

    async getPaymentAging() {
        // Group overdue amounts by age buckets (0-30, 31-60, 61-90, 90+)
        const today = new Date();

        const pos = await this.prisma.purchaseOrder.findMany({
            where: {
                status: { not: 'FULLY_PAID' },
                paymentDueDate: { lt: today }
            },
            include: { payments: true }
        }) as POWithPayments[];

        const buckets = {
            '0-30': 0,
            '31-60': 0,
            '61-90': 0,
            '90+': 0
        };

        pos.forEach(po => {
            const totalPaid = po.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const outstanding = Number(po.totalAmount) - totalPaid;

            if (outstanding <= 0) return;

            const diffTime = Math.abs(today.getTime() - new Date(po.paymentDueDate).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 30) buckets['0-30'] += outstanding;
            else if (diffDays <= 60) buckets['31-60'] += outstanding;
            else if (diffDays <= 90) buckets['61-90'] += outstanding;
            else buckets['90+'] += outstanding;
        });

        return buckets;
    }
}
