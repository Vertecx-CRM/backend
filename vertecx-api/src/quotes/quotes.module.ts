import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { Quotes } from './entities/quotes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersServices } from 'src/order-services/entities/orders-services.entity';
import { States } from 'src/shared/entities/states.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quotes, OrdersServices, States])],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
