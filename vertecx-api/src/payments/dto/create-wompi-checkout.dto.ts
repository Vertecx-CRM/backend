import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWompiCheckoutDto {
  @ApiPropertyOptional({
    example: 'https://tu-frontend.com/payments/register?saleId=123',
    description:
      'URL a la que Wompi redirige al cliente despues del flujo de pago.',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false }, { message: 'redirectUrl debe ser una URL valida' })
  redirectUrl?: string;
}
