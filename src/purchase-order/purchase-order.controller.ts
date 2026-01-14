import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto, POStatus } from './dto/update-purchase-order-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('purchase-orders')
@ApiBearerAuth('JWT-auth')
@Controller('purchase-orders')
export class PurchaseOrderController {
    constructor(private readonly purchaseOrderService: PurchaseOrderService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new purchase order' })
    create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
        return this.purchaseOrderService.create(createPurchaseOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all purchase orders' })
    @ApiQuery({ name: 'vendorId', required: false })
    @ApiQuery({ name: 'status', enum: POStatus, required: false })
    findAll(@Query('vendorId') vendorId?: string, @Query('status') status?: POStatus) {
        return this.purchaseOrderService.findAll(vendorId, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get purchase order details' })
    findOne(@Param('id') id: string) {
        return this.purchaseOrderService.findOne(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update purchase order status' })
    updateStatus(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderStatusDto) {
        return this.purchaseOrderService.updateStatus(id, updateDto);
    }
}
