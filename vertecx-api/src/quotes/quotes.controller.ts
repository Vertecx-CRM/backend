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
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear cotizacion con detalle' })
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
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('observation') observation?: string,
  ) {
    return this.quotesService.cancel(id, observation);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body('observation') observation?: string,
  ) {
    return this.quotesService.approve(id, observation);
  }

  @Patch(':id/accept-client')
  @UseGuards(JwtAuthGuard)
  acceptClient(
    @Req() { user }: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('observation') observation?: string,
  ) {
    return this.quotesService.acceptForClient(user, id, observation);
  }

  @Patch(':id/link-order')
  @UseGuards(JwtAuthGuard)
  linkOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('ordersServicesId', ParseIntPipe) ordersServicesId: number,
  ) {
    return this.quotesService.linkOrder(id, ordersServicesId);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Completar cotizacion y generar venta asociada' })
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.complete(id);
  }

  @Patch(':id/cancel-client')
  @UseGuards(JwtAuthGuard)
  cancelClient(
    @Req() { user }: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('observation') observation?: string,
  ) {
    return this.quotesService.cancelForClient(user, id, observation);
  }
}
