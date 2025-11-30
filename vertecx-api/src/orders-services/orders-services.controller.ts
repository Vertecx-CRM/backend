import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersServicesService } from './orders-services.service';
import { CreateOrdersServicesDto } from './dto/create-orders-services.dto';
import { UpdateOrdersServicesDto } from './dto/update-orders-services.dto';
import { AddProductDto } from './dto/add-product.dto';
import { AssignTechniciansDto } from './dto/assign-technicians.dto';
import { FinishOrderDto } from './dto/finish-order.dto';
import { AddFileDto } from './dto/add-file.dto';
import { RemoveFileDto } from './dto/remove-file.dto';
import { ReprogramOrderDto } from './dto/reprogram-order.dto';

@Controller('orders-services')
export class OrdersServicesController {
  constructor(private readonly service: OrdersServicesService) {}

  @Post()
  create(@Body() dto: CreateOrdersServicesDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/history')
  history(@Param('id', ParseIntPipe) id: number) {
    return this.service.history(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrdersServicesDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/products')
  addProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: AddProductDto) {
    return this.service.addProduct(id, dto);
  }

  @Delete(':id/products/:productId')
  removeProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.service.removeProduct(id, productId);
  }

  @Patch(':id/technicians')
  assignTechnicians(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTechniciansDto,
  ) {
    return this.service.assignTechnicians(id, dto);
  }

  @Patch(':id/finish')
  finish(@Param('id', ParseIntPipe) id: number, @Body() dto: FinishOrderDto) {
    return this.service.finishOrder(id, dto);
  }

  @Patch(':id/reprogram')
  reprogram(@Param('id', ParseIntPipe) id: number, @Body() dto: ReprogramOrderDto) {
    return this.service.reprogram(id, dto);
  }

  @Get(':id/files')
  getFiles(@Param('id', ParseIntPipe) id: number) {
    return this.service.getFiles(id);
  }

  @Get(':id/files/:index')
  getFileByIndex(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.service.getFileByIndex(id, index);
  }

  @Post(':id/files')
  addFile(@Param('id', ParseIntPipe) id: number, @Body() dto: AddFileDto) {
    return this.service.addFile(id, dto);
  }

  @Delete(':id/files/index/:index')
  removeFileByIndex(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.service.removeFileByIndex(id, index);
  }

  @Delete(':id/files')
  removeFile(@Param('id', ParseIntPipe) id: number, @Body() dto: RemoveFileDto) {
    return this.service.removeFile(id, dto);
  }

  @Get('by-technician/:technicianId')
  findByTechnician(@Param('technicianId', ParseIntPipe) technicianId: number) {
    return this.service.findByTechnician(technicianId);
  }

  @Get('by-client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.service.findByClient(clientId);
  }

  @Get('by-state/:stateId')
  findByState(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.service.findByState(stateId);
  }

  @Get('by-date-range')
  findByDateRange(@Query('from') from: string, @Query('to') to: string) {
    return this.service.findByDateRange(from, to);
  }
}
