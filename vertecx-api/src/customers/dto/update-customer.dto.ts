import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    description: 'Ciudad del cliente',
    example: 'Medellín',
    required: false
  })
  @IsString()
  @IsOptional()
  customercity?: string;

  @ApiProperty({
    description: 'Código postal del cliente',
    example: '050001',
    required: false
  })
  @IsString()
  @IsOptional()
  customerzipcode?: string;
}