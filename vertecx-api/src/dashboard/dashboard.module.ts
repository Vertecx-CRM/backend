import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customers } from "src/customers/entities/customers.entity";
import { ProductCategory } from "src/products-categories/entities/product-category.entity";
import { Products } from "src/products/entities/products.entity";
import { Purchasesmanagement } from "src/purchases/entities/purchasesmanagement.entity";
import { Sales } from "src/sales/entities/sales.entity";
import { Ordersservices } from "src/services/entities/ordersservices.entity";
import { States } from "src/shared/entities/states.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Servicerequests } from "src/services/entities/servicerequests.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sales,
      Purchasesmanagement,
      ProductCategory,
      Products,
      Ordersservices,
      Customers,
      States,
      Servicerequests
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
