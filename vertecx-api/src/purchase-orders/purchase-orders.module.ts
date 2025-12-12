// purchase-orders/purchase-orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrder } from '../shared/entities/purchase-order.entity';
import { States } from 'src/shared/entities/states.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, States, Suppliers]),
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}