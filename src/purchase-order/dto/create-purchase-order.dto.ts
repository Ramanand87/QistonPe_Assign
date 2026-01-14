import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class POItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    unitPrice: number;
}

export class CreatePurchaseOrderDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    vendorId: string;

    @ApiProperty()
    @IsDateString()
    date: string; // User provides PO Date

    @ApiProperty({ type: [POItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => POItemDto)
    items: POItemDto[];
}
