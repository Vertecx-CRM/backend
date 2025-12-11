import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuoteDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  quotesid: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  ordersservicesid: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  statesid: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  quotedata?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  observation?: string;
}
