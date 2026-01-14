import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
    CASH = 'CASH',
    CHEQUE = 'CHEQUE',
    NEFT = 'NEFT',
    RTGS = 'RTGS',
    UPI = 'UPI',
}

export class CreatePaymentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    poId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
