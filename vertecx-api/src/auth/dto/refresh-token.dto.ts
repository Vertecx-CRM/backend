import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Transform(({ value, obj }) => value ?? obj?.refreshToken)
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
