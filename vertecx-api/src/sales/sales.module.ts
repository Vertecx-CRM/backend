import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sales } from './entities/sales.entity';
import { Salesdetail } from './entities/salesdetail.entity';
import { Products } from 'src/products/entities/products.entity';
import { Customers } from 'src/customers/entities/customers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sales, Salesdetail, Products, Customers])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
