import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersServicesService } from './orders-services.service';
import { OrdersServicesController } from './orders-services.controller';

import { OrdersServices } from './entities/orders-services.entity';
import { OrdersServicesProducts } from './entities/orders-services-products.entity';
import { OrdersServicesServices } from './entities/orders-services-services.entity';
import { OrdersServicesHistory } from './entities/orders-services-history.entity';
import { OrdersServicesWarranty } from './entities/orders-services-warranty.entity';

import { Products } from 'src/products/entities/products.entity';
import { Services } from 'src/services/entities/services.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { States } from 'src/shared/entities/states.entity';
import { Users } from 'src/users/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdersServices,
      OrdersServicesProducts,
      OrdersServicesServices,
      OrdersServicesHistory,
      OrdersServicesWarranty,
      Products,
      Services,
      Technicians,
      Customers,
      States,
      Users,
    ]),
  ],
  controllers: [OrdersServicesController],
  providers: [OrdersServicesService],
  exports: [OrdersServicesService],
})
export class OrdersServicesModule {}
