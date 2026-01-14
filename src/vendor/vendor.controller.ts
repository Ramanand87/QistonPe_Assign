import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('vendors')
@ApiBearerAuth('JWT-auth')
@Controller('vendors')
export class VendorController {
    constructor(private readonly vendorService: VendorService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new vendor' })
    @ApiResponse({ status: 201, description: 'Vendor created successfully.' })
    @ApiResponse({ status: 409, description: 'Vendor name or email already exists.' })
    create(@Body() createVendorDto: CreateVendorDto) {
        return this.vendorService.create(createVendorDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all vendors' })
    findAll() {
        return this.vendorService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get vendor details' })
    @ApiResponse({ status: 404, description: 'Vendor not found.' })
    findOne(@Param('id') id: string) {
        return this.vendorService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update vendor information' })
    update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
        return this.vendorService.update(id, updateVendorDto);
    }
}
