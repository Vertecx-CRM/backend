import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersServices } from './entities/orders-services.entity';
import { OrdersServicesProducts } from './entities/orders-services-products.entity';

import { Products } from 'src/products/entities/products.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { States } from 'src/shared/entities/states.entity';

import { OrdersServicesService } from './orders-services.service';
import { OrdersServicesController } from './orders-services.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdersServices,
      OrdersServicesProducts,
      Products,
      Customers,
      Technicians,
      States,
    ]),
  ],
  controllers: [OrdersServicesController],
  providers: [OrdersServicesService],
    exports: [
    TypeOrmModule,
  ],
})
export class OrdersServicesModule {}
