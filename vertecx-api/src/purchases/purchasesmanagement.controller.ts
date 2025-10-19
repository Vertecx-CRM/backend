import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreatePurchasesmanagementDto } from './dto/create-purchasesmanagement.dto';
import { UpdatePurchasesmanagementDto } from './dto/update-purchasesmanagement.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { PurchasesmanagementService } from './purchasesmanagement.service';

@ApiTags('Purchases Management')
@Controller('purchasesmanagement')
export class PurchasesmanagementController {
  constructor(private readonly service: PurchasesmanagementService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un registro de compras' })
  @ApiResponse({ status: 201, type: Purchasesmanagement })
  create(@Body() dto: CreatePurchasesmanagementDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los registros de compras' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro por ID' })
  @ApiResponse({ status: 200, type: Purchasesmanagement })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de compras' })
  update(@Param('id') id: number, @Body() dto: UpdatePurchasesmanagementDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de compras' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
