import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchasesmanagementDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  purchaseorderid: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  numberoforder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  reference?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  stateid?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  supplierid?: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  createddate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  updateddate: Date;
}
