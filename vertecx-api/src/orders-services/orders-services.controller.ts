import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { OrdersServicesService } from './orders-services.service';
import { CreateOrdersServicesDto } from './dto/create-orders-services.dto';
import { UpdateOrdersServicesDto } from './dto/update-orders-services.dto';
import { AddProductDto } from './dto/add-product.dto';
import { AddServiceDto } from './dto/add-service.dto';
import { AssignTechniciansDto } from './dto/assign-technicians.dto';
import { FinishOrderDto } from './dto/finish-order.dto';
import { AddFileDto } from './dto/add-file.dto';
import { RemoveFileDto } from './dto/remove-file.dto';
import { ReprogramOrderDto } from './dto/reprogram-order.dto';
import { AddWorklogDto } from './dto/add-worklog.dto';
import { ReportWarrantyDto } from './dto/report-warranty.dto';

@Controller('orders-services')
export class OrdersServicesController {
  constructor(private readonly ordersServicesService: OrdersServicesService) {}

  @Post()
  create(@Body() dto: CreateOrdersServicesDto) {
    return this.ordersServicesService.create(dto);
  }

  @Get()
  findAll() {
    return this.ordersServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersServicesService.findOne(id);
  }

  @Get(':id/history')
  history(@Param('id', ParseIntPipe) id: number, @Query('type') type?: 'SYSTEM' | 'TECH') {
    return this.ordersServicesService.history(id, type);
  }

  @Post(':id/history')
  addWorklog(@Param('id', ParseIntPipe) id: number, @Body() dto: AddWorklogDto) {
    return this.ordersServicesService.addWorklog(id, dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrdersServicesDto) {
    return this.ordersServicesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersServicesService.remove(id);
  }

  @Post(':id/products')
  addProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: AddProductDto) {
    return this.ordersServicesService.addProduct(id, dto);
  }

  @Delete(':id/products/:productId')
  removeProduct(@Param('id', ParseIntPipe) id: number, @Param('productId', ParseIntPipe) productId: number) {
    return this.ordersServicesService.removeProduct(id, productId);
  }

  @Post(':id/services')
  addService(@Param('id', ParseIntPipe) id: number, @Body() dto: AddServiceDto) {
    return this.ordersServicesService.addService(id, dto);
  }

  @Delete(':id/services/:serviceId')
  removeService(@Param('id', ParseIntPipe) id: number, @Param('serviceId', ParseIntPipe) serviceId: number) {
    return this.ordersServicesService.removeService(id, serviceId);
  }

  @Patch(':id/technicians')
  assignTechnicians(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignTechniciansDto) {
    return this.ordersServicesService.assignTechnicians(id, dto);
  }

  @Patch(':id/finish')
  finishOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: FinishOrderDto) {
    return this.ordersServicesService.finishOrder(id, dto);
  }

  @Patch(':id/reprogram')
  reprogram(@Param('id', ParseIntPipe) id: number, @Body() dto: ReprogramOrderDto) {
    return this.ordersServicesService.reprogram(id, dto);
  }

  @Get(':id/files')
  getFiles(@Param('id', ParseIntPipe) id: number) {
    return this.ordersServicesService.getFiles(id);
  }

  @Get(':id/files/index/:index')
  getFileByIndex(@Param('id', ParseIntPipe) id: number, @Param('index', ParseIntPipe) index: number) {
    return this.ordersServicesService.getFileByIndex(id, index);
  }

  @Post(':id/files')
  addFile(@Param('id', ParseIntPipe) id: number, @Body() dto: AddFileDto) {
    return this.ordersServicesService.addFile(id, dto);
  }

  @Delete(':id/files/index/:index')
  removeFileByIndex(@Param('id', ParseIntPipe) id: number, @Param('index', ParseIntPipe) index: number) {
    return this.ordersServicesService.removeFileByIndex(id, index);
  }

  @Delete(':id/files')
  removeFile(@Param('id', ParseIntPipe) id: number, @Body() dto: RemoveFileDto) {
    return this.ordersServicesService.removeFile(id, dto);
  }

  @Patch(':id/warranty/mark')
  markWarranty(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const actorUserId = req?.user?.userid ? Number(req.user.userid) : undefined;
    return this.ordersServicesService.markWarranty(id, actorUserId);
  }

  @Patch(':id/warranty/report')
  reportWarranty(@Param('id', ParseIntPipe) id: number, @Body() dto: ReportWarrantyDto, @Req() req: any) {
    const actorUserId = req?.user?.userid ? Number(req.user.userid) : undefined;
    return this.ordersServicesService.reportWarranty(id, dto, actorUserId);
  }

  @Get('by-technician/:technicianId')
  findByTechnician(@Param('technicianId', ParseIntPipe) technicianId: number) {
    return this.ordersServicesService.findByTechnician(technicianId);
  }

  @Get('by-client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.ordersServicesService.findByClient(clientId);
  }

  @Get('by-state/:stateId')
  findByState(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.ordersServicesService.findByState(stateId);
  }

  @Get('by-date-range')
  findByDateRange(@Query('from') from: string, @Query('to') to: string) {
    return this.ordersServicesService.findByDateRange(from, to);
  }
}
