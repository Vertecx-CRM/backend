import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class RequestAvailabilityOptionDto {
  @ApiProperty({ example: "2026-03-20" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @ApiProperty({ example: "09:00" })
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  startTime: string;

  @ApiProperty({ example: "11:00" })
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  endTime: string;
}
