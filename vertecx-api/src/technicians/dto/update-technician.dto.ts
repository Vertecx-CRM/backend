// src/technicians/dto/update-technician.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTechnicianDto } from './create-technician.dto';

export class UpdateTechnicianDto extends PartialType(CreateTechnicianDto) {}
