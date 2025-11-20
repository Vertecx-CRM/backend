import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SalesModule } from './sales/sales.module';
import { UsersModule } from './users/users.module';
import { TechniciansModule } from './technicians/technicians.module';
import { CustomersModule } from './customers/customers.module';
import { AppoimentsModule } from './appoiments/appoiments.module';
import { RolesModule } from './roles/roles.module';
import { ProductsModule } from './products/products.module';
import { ProductsCategoriesModule } from './products-categories/products-categories.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ServicesModule } from './services/services.module';
import { QuotesModule } from './quotes/quotes.module';
import { RequestsModule } from './requests/requests.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchasesmanagementModule } from './purchases/purchasesmanagement.module';
import { TypeofdocumentsModule } from './typeofdocuments/typeofdocuments.module';
import { MailModule } from './shared/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { TechniciantypesModule } from './technicians/techniciantypes/techniciantypes.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SalesModule,
    UsersModule,
    PurchasesmanagementModule,
    TechniciansModule,
    CustomersModule,
    AppoimentsModule,
    RolesModule,
    ProductsModule,
    ProductsCategoriesModule,
    PurchaseOrdersModule,
    ServicesModule,
    QuotesModule,
    RequestsModule,
    SuppliersModule,
    TypeofdocumentsModule,
    MailModule,
    TechniciantypesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
