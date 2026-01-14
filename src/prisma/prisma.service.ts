import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        let retries = 5;
        while (retries > 0) {
            try {
                await this.$connect();
                this.logger.log('Successfully connected to database');
                return;
            } catch (error: any) {
                retries--;
                this.logger.warn(`Database connection failed: ${error.message}. Retries left: ${retries}`);
                if (retries === 0) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
