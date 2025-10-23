import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalesModule } from './sales/sales.module';
import { PurchasesModule } from './purchases/purchases.module';
import { UsersModule } from './users/users.module';
import { TechniciansModule } from './technicians/technicians.module';
import { ProvidersModule } from './providers/providers.module';
import { CustomersModule } from './customers/customers.module';
import { AppoimentsModule } from './appoiments/appoiments.module';
import { RolesModule } from './roles/roles.module';
import { ProductsModule } from './products/products.module';
import { ProductsCategoriesModule } from './products-categories/products-categories.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ServicesModule } from './services/services.module';
import { QuotesModule } from './quotes/quotes.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [SalesModule, PurchasesModule, UsersModule, TechniciansModule, ProvidersModule, CustomersModule, AppoimentsModule, RolesModule, ProductsModule, ProductsCategoriesModule, PurchaseOrdersModule, ServicesModule, QuotesModule, RequestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
