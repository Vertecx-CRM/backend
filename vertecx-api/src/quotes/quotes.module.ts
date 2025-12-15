import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { Quotes } from './entities/quotes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersServices } from 'src/orders-services/entities/orders-services.entity';
import { States } from 'src/shared/entities/states.entity';
import { QuoteDetail } from './entities/quotedetail.entity';
import { ServiceRequest } from 'src/requests/entities/servicerequest.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Products } from 'src/products/entities/products.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotes,
      QuoteDetail,
      ServiceRequest,
      OrdersServices,
      States,
      Customers,
      Technicians,
      Products
    ]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
