import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdersServicesDto } from './create-orders-services.dto';

export class UpdateOrdersServicesDto extends PartialType(CreateOrdersServicesDto) {}
