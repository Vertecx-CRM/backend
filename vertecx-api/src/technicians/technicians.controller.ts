// src/technicians/technicians.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  create(@Body() createTechnicianDto: CreateTechnicianDto) {
    return this.techniciansService.create(createTechnicianDto);
  }

  @Get()
  findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // aquí id sería el technicianid (el de la tabla technicians)
    return this.techniciansService.findOne(+id);
  }

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() updateTechnicianDto: UpdateTechnicianDto) {
    // 👀 aquí decidimos que el id es el userid, porque update llama a UsersService.update
    return this.techniciansService.update(+userId, updateTechnicianDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.techniciansService.remove(+id);
  }
}
