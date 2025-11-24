import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { OrdersServicesService } from './orders-services.service';

import { CreateOrdersServicesDto } from './dto/create-orders-services.dto';
import { UpdateOrdersServicesDto } from './dto/update-orders-services.dto';
import { AddProductDto } from './dto/add-product.dto';
import { AssignTechniciansDto } from './dto/assign-technicians.dto';
import { FinishOrderDto } from './dto/finish-order.dto';

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
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateOrdersServicesDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post(':id/add-product')
  addProduct(@Param('id') id: number, @Body() dto: AddProductDto) {
    return this.service.addProduct(id, dto);
  }

  @Delete(':orderId/remove-product/:productId')
  removeProduct(
    @Param('orderId') orderId: number,
    @Param('productId') productId: number,
  ) {
    return this.service.removeProduct(orderId, productId);
  }

  @Post(':id/assign-technicians')
  assignTechnicians(
    @Param('id') id: number,
    @Body() dto: AssignTechniciansDto,
  ) {
    return this.service.assignTechnicians(id, dto);
  }

  @Post(':id/finish')
  finishOrder(@Param('id') id: number, @Body() dto: FinishOrderDto) {
    return this.service.finishOrder(id, dto);
  }

  @Get('filters/by-technician/:id')
  findByTechnician(@Param('id') id: number) {
    return this.service.findByTechnician(id);
  }

  @Get('filters/by-client/:id')
  findByClient(@Param('id') id: number) {
    return this.service.findByClient(id);
  }

  @Get('filters/by-state/:id')
  findByState(@Param('id') id: number) {
    return this.service.findByState(id);
  }

  @Get('filters/date-range')
  findByDateRange(@Query('from') from: string, @Query('to') to: string) {
    return this.service.findByDateRange(from, to);
  }
}
