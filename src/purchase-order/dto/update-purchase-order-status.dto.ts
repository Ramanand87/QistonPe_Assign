import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum POStatus {
    DRAFT = 'DRAFT',
    APPROVED = 'APPROVED',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    FULLY_PAID = 'FULLY_PAID',
}

export class UpdatePurchaseOrderStatusDto {
    @ApiProperty({ enum: POStatus })
    @IsEnum(POStatus)
    @IsNotEmpty()
    status: POStatus;
}
