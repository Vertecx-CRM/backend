import { OmitType } from '@nestjs/swagger';
import { CreateSaleDto } from './create-sale.dto';

export class CreateSaleFromAuthDto extends OmitType(CreateSaleDto, [
  'customerid',
] as const) {}
