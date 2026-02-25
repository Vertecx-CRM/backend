import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEmail,
    IsNumber,
    IsArray,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationItemDto {
    @ApiProperty({ example: 'Pintura Blanca', description: 'Nombre del producto' })
    @IsString()
    @IsNotEmpty()
    producto: string;

    @ApiProperty({ example: 5, description: 'Cantidad' })
    @IsNumber()
    @Min(1)
    cantidad: number;

    @ApiProperty({ example: 50000, description: 'Precio unitario' })
    @IsNumber()
    @Min(0)
    precioUnitario: number;
}

export class SendNotificationDto {
    @ApiProperty({ example: 'OC-1234567890', description: 'Número de la orden' })
    @IsString()
    @IsNotEmpty()
    numeroOrden: string;

    @ApiProperty({ example: 1, description: 'ID del proveedor' })
    @IsNumber()
    @Min(1)
    proveedorId: number;

    @ApiProperty({ example: 'Distribuidora ABC', description: 'Nombre del proveedor' })
    @IsString()
    @IsNotEmpty()
    supplierName: string;

    @ApiProperty({ example: 'proveedor@email.com', required: false })
    @IsEmail()
    @IsOptional()
    supplierEmail?: string;

    @ApiProperty({ example: '3001234567', required: false })
    @IsString()
    @IsOptional()
    supplierPhone?: string;

    @ApiProperty({ type: [NotificationItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotificationItemDto)
    productos: NotificationItemDto[];

    @ApiProperty({ example: 297500, description: 'Total de la orden' })
    @IsNumber()
    @Min(0)
    total: number;

    @ApiProperty({ example: '2026-02-25', description: 'Fecha estimada de entrega' })
    @IsString()
    @IsOptional()
    fecha?: string;

    @ApiProperty({ example: 'Entrega urgente', required: false })
    @IsString()
    @IsOptional()
    descripcion?: string;
}
