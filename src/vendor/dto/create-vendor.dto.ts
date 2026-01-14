import { IsString, IsEmail, IsNotEmpty, IsInt, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
    @ApiProperty({ example: 'Acme Corp', description: 'Vendor name (required, unique)' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'John Doe', description: 'Contact person name' })
    @IsOptional()
    @IsString()
    contactPerson?: string;

    @ApiProperty({ example: 'john@acme.com', description: 'Email (required, unique, validated)' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ example: '1234567890', description: 'Phone number' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 30, description: 'Payment terms in days (7, 15, 30, 45, 60)' })
    @IsInt()
    @IsIn([7, 15, 30, 45, 60])
    paymentTerms: number;
}
