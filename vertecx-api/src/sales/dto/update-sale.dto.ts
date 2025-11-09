import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateSaleDto } from './create-sale.dto';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @ApiProperty({
    description: 'Fecha en que se actualizó la venta (opcional)',
    example: '2025-11-09T18:00:00.000Z',
    required: false,
  })
  updateddate?: Date;
}
