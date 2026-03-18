import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateWompiCheckoutDto } from './dto/create-wompi-checkout.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('wompi/sales/:saleId/checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Crear la sesion de checkout de Wompi para una venta pendiente',
  })
  @ApiParam({ name: 'saleId', type: Number, example: 123 })
  @ApiResponse({ status: 201, description: 'Sesion de checkout lista.' })
  createCheckoutSession(
    @Req() { user }: any,
    @Param('saleId', ParseIntPipe) saleId: number,
    @Body() dto: CreateWompiCheckoutDto,
  ) {
    return this.paymentsService.createWompiCheckoutSession(
      user,
      saleId,
      dto?.redirectUrl,
    );
  }

  @Get('wompi/transactions/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Consultar una transaccion de Wompi y sincronizar su estado con la venta',
  })
  @ApiParam({ name: 'transactionId', type: String, example: '123456-7890' })
  @ApiResponse({ status: 200, description: 'Estado de la transaccion consultado.' })
  getTransaction(
    @Req() { user }: any,
    @Param('transactionId') transactionId: string,
    @Query('saleId', ParseIntPipe) saleId: number,
  ) {
    return this.paymentsService.syncTransactionWithSale(user, saleId, transactionId);
  }

  @Post('wompi/events')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook de eventos de Wompi',
  })
  @ApiResponse({ status: 200, description: 'Evento recibido.' })
  handleEvent(
    @Body() payload: any,
    @Headers('x-event-checksum') checksum?: string,
  ) {
    return this.paymentsService.handleWompiEvent(payload, checksum);
  }
}
