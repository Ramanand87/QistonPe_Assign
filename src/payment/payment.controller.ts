import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post()
    @ApiOperation({ summary: 'Record a payment against a PO' })
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentService.create(createPaymentDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all payments' })
    findAll() {
        return this.paymentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get payment details' })
    findOne(@Param('id') id: string) {
        return this.paymentService.findOne(id);
    }
}
