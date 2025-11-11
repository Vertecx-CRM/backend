// src/technicians/techniciantypes.controller.ts
import { Controller, Get } from '@nestjs/common';
import { TechniciantypesService } from './techniciantypes.service';
import { Techniciantypes } from '../entities/technician_types.entity';


@Controller('techniciantypes')
export class TechniciantypesController {
  constructor(private readonly techniciantypesService: TechniciantypesService) {}

  @Get()
  async findAll(): Promise<Techniciantypes[]> {
    return this.techniciantypesService.findAll();
  }
}