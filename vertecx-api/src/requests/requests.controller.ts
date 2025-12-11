import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateServiceRequestDto } from './dto/update-request.dto';

@Controller('service-requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.requestsService.create(dto);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceRequestDto) {
    return this.requestsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.remove(id);
  }

  @Get('states/all')
  findAllStates() {
    return this.requestsService.findAllStates();
  }
}
