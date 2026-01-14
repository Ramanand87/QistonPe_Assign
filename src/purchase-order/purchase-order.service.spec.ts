import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderService } from './purchase-order.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PurchaseOrderService', () => {
    let service: PurchaseOrderService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PurchaseOrderService,
                {
                    provide: PrismaService,
                    useValue: {
                        vendor: {
                            findUnique: jest.fn(),
                        },
                        purchaseOrder: {
                            findUnique: jest.fn(),
                            findFirst: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PurchaseOrderService>(PurchaseOrderService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should calculate payment due date correctly based on vendor terms', async () => {
            const createDto: any = {
                vendorId: 'vendor-1',
                date: '2023-01-01',
                items: [{ description: 'Item 1', quantity: 2, unitPrice: 100 }],
            };

            const mockVendor = {
                id: 'vendor-1',
                paymentTerms: 30, // 30 days
                status: 'ACTIVE',
            };

            (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(mockVendor);
            (prisma.purchaseOrder.findFirst as jest.Mock).mockResolvedValue(null); // No previous PO
            (prisma.purchaseOrder.create as jest.Mock).mockImplementation((args) => args.data);

            await service.create(createDto);

            expect(prisma.vendor.findUnique).toHaveBeenCalledWith({ where: { id: 'vendor-1' } });

            const createdData = (prisma.purchaseOrder.create as jest.Mock).mock.calls[0][0].data;

            // Check date diff is 30 days
            const diffTime = Math.abs(createdData.paymentDueDate.getTime() - createdData.date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            expect(diffDays).toEqual(30);
            expect(createdData.totalAmount).toEqual(200);
            expect(createdData.status).toEqual('DRAFT');
        });
    });
});
