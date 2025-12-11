import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesQueryDto } from './dto/services-query.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('types')
  getTypes() {
    return this.servicesService.getTypes();
  }

  @Get('states')
  getStates() {
    return this.servicesService.getStates();
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  findAll(@Query() q: ServicesQueryDto) {
    return this.servicesService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(Number(id));
  }
}
