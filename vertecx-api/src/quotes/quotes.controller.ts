import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cotización con detalle' })
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('observation') observation?: string,
  ) {
    return this.quotesService.cancel(id, observation);
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body('observation') observation?: string,
  ) {
    return this.quotesService.approve(id, observation);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Completar cotización y generar venta asociada' })
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.complete(id);
  }

  @Patch(':id/cancel-client')
  cancelClient(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotesService.cancelForClient(id);
  }
}
