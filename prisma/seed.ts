import { PrismaClient, VendorStatus, POStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Vendors (5 vendors as required)
    const vendorsData = [
        { name: 'Acme Corp', email: 'contact@acme.com', paymentTerms: 30, phone: '1234567890', contactPerson: 'John Smith' },
        { name: 'Globex Inc', email: 'info@globex.com', paymentTerms: 15, phone: '0987654321', contactPerson: 'Jane Doe' },
        { name: 'Soylent Corp', email: 'sales@soylent.com', paymentTerms: 45, phone: '1122334455', contactPerson: 'Bob Wilson' },
        { name: 'Initech', email: 'support@initech.com', paymentTerms: 60, phone: '5544332211', contactPerson: 'Michael Bolton' },
        { name: 'Umbrella Corp', email: 'bio@umbrella.com', paymentTerms: 7, status: VendorStatus.INACTIVE, contactPerson: 'Albert Wesker' },
    ];

    const vendors: any[] = [];
    for (const v of vendorsData) {
        const vendor = await prisma.vendor.upsert({
            where: { email: v.email },
            update: {},
            create: {
                name: v.name,
                email: v.email,
                paymentTerms: v.paymentTerms,
                phone: v.phone,
                contactPerson: v.contactPerson,
                status: v.status || VendorStatus.ACTIVE,
            },
        });
        vendors.push(vendor);
    }
    console.log(`Created ${vendors.length} vendors`);

    // 2. Create Purchase Orders (15 POs as required)
    const today = new Date();
    const activeVendors = vendors.filter(v => v.status === VendorStatus.ACTIVE);

    if (activeVendors.length === 0) {
        console.log('No active vendors found');
        return;
    }

    const pos: any[] = [];

    for (let i = 1; i <= 15; i++) {
        const vendor = activeVendors[i % activeVendors.length];
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 2));

        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + vendor.paymentTerms);

        const poNumber = `PO-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${String(i).padStart(3, '0')}`;
        const amount = (i * 1000) + 500;

        const po = await prisma.purchaseOrder.upsert({
            where: { poNumber },
            update: {},
            create: {
                poNumber,
                vendorId: vendor.id,
                date: date,
                paymentDueDate: dueDate,
                totalAmount: amount,
                status: POStatus.APPROVED,
                items: [
                    { description: 'Item A', quantity: 1, unitPrice: amount * 0.4 },
                    { description: 'Item B', quantity: 1, unitPrice: amount * 0.6 },
                ],
            },
        });
        pos.push(po);
    }
    console.log(`Created ${pos.length} purchase orders`);

    // 3. Create Payments (10 payments as required)
    const paymentMethods = [PaymentMethod.NEFT, PaymentMethod.UPI, PaymentMethod.CHEQUE, PaymentMethod.CASH, PaymentMethod.RTGS];

    for (let i = 0; i < 10; i++) {
        const po = pos[i];
        if (!po) continue;

        const paymentAmount = Number(po.totalAmount) / 2;
        const paymentRef = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;

        // Check if payment already exists
        const existing = await prisma.payment.findUnique({ where: { paymentRef } });
        if (existing) continue;

        await prisma.payment.create({
            data: {
                paymentRef,
                poId: po.id,
                date: new Date(),
                amount: paymentAmount,
                method: paymentMethods[i % paymentMethods.length],
                notes: 'Partial payment - seed data',
            }
        });

        await prisma.purchaseOrder.update({
            where: { id: po.id },
            data: { status: POStatus.PARTIALLY_PAID }
        });
    }
    console.log('Created 10 payments');

    console.log('Seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
