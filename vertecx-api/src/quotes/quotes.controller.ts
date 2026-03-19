import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cotización con detalle' })
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() { user }: any) {
    return this.quotesService.findAllForUser(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() { user }: any, @Param('id') id: string) {
    return this.quotesService.findOneForUser(user, +id);
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
  @UseGuards(JwtAuthGuard)
  cancelClient(
    @Req() { user }: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotesService.cancelForClient(user, id);
  }
}
