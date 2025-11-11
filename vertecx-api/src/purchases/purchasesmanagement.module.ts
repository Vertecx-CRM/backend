import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesmanagementService } from './purchasesmanagement.service';
import { PurchasesmanagementController } from './purchasesmanagement.controller';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { States } from 'src/shared/entities/states.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';
import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';
import { Products } from 'src/products/entities/products.entity';
import { Productcategories } from 'src/products/entities/productcategories.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purchasesmanagement,
      States,
      Suppliers,
      PurchaseProduct,
      Products,
      Productcategories,
    ]),
  ],
  controllers: [PurchasesmanagementController],
  providers: [PurchasesmanagementService],
})
export class PurchasesmanagementModule {}
