import { PartialType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum VendorStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
    @ApiPropertyOptional({ enum: VendorStatus })
    @IsOptional()
    @IsEnum(VendorStatus)
    status?: VendorStatus;
}
