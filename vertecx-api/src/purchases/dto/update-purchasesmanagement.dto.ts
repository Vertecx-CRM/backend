import { PartialType } from '@nestjs/swagger';
import { CreatePurchasesmanagementDto } from './create-purchasesmanagement.dto';

export class UpdatePurchasesmanagementDto extends PartialType(
  CreatePurchasesmanagementDto,
) {}
