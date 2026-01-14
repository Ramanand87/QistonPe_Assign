import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('vendor-outstanding')
    @ApiOperation({ summary: 'Get outstanding balance by vendor' })
    getVendorOutstanding() {
        return this.analyticsService.getVendorOutstanding();
    }

    @Get('payment-aging')
    @ApiOperation({ summary: 'Get payment aging report' })
    getPaymentAging() {
        return this.analyticsService.getPaymentAging();
    }
}
