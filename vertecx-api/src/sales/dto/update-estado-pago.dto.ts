import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoPagoDto {
    @ApiProperty({
        example: 'Pagada',
        description: 'Estado de pago de la venta',
        enum: ['Abonada', 'Pagada'],
    })
    @IsNotEmpty()
    @IsIn(['Abonada', 'Pagada'], {
        message: 'estadoPago debe ser "Abonada" o "Pagada"',
    })
    estadoPago: 'Abonada' | 'Pagada';
}
