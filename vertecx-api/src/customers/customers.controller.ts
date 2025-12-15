import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un cliente para este usuario' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Incluir relaciones con users y sales' })
  @ApiResponse({ status: 200, description: 'Lista de clientes', type: [CustomerResponseDto] })
  findAll(@Query('includeRelations') includeRelations?: string) {
    const include = includeRelations === 'true';
    return this.customersService.findAll(include);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Incluir relaciones con users y sales' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @Query('includeRelations') includeRelations?: string
  ) {
    const include = includeRelations === 'true';
    return this.customersService.findOne(id, include);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener cliente por ID de usuario' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Incluir relaciones con users y sales' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findByUserId(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) userId: number,
    @Query('includeRelations') includeRelations?: string
  ) {
    const include = includeRelations === 'true';
    return this.customersService.findByUserId(userId, include);
  }

  @Get('city/:city')
  @ApiOperation({ summary: 'Buscar clientes por ciudad' })
  @ApiResponse({ status: 200, description: 'Clientes encontrados', type: [CustomerResponseDto] })
  findByCity(@Param('city') city: string) {
    return this.customersService.findByCity(city);
  }

  @Get('count/total')
  @ApiOperation({ summary: 'Contar total de clientes' })
  @ApiResponse({ status: 200, description: 'Total de clientes', type: Number })
  count() {
    return this.customersService.count();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar porque tiene ventas asociadas' })
  remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number) {
    return this.customersService.remove(id);
  }
}