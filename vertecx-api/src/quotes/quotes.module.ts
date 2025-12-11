import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { Quotes } from './entities/quotes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersServices } from 'src/orders-services/entities/orders-services.entity';
import { States } from 'src/shared/entities/states.entity';
import { QuoteDetail } from './entities/quotedetail.entity';
import { ServiceRequest } from 'src/requests/entities/servicerequest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotes,
      QuoteDetail,
      OrdersServices,
      ServiceRequest,
      States,
    ]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
