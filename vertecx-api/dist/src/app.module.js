"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const sales_module_1 = require("./sales/sales.module");
const users_module_1 = require("./users/users.module");
const technicians_module_1 = require("./technicians/technicians.module");
const customers_module_1 = require("./customers/customers.module");
const appoiments_module_1 = require("./appoiments/appoiments.module");
const roles_module_1 = require("./roles/roles.module");
const products_module_1 = require("./products/products.module");
const products_categories_module_1 = require("./products-categories/products-categories.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const services_module_1 = require("./services/services.module");
const quotes_module_1 = require("./quotes/quotes.module");
const requests_module_1 = require("./requests/requests.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const purchasesmanagement_module_1 = require("./purchases/purchasesmanagement.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            sales_module_1.SalesModule,
            users_module_1.UsersModule,
            purchasesmanagement_module_1.PurchasesmanagementModule,
            technicians_module_1.TechniciansModule,
            customers_module_1.CustomersModule,
            appoiments_module_1.AppoimentsModule,
            roles_module_1.RolesModule,
            products_module_1.ProductsModule,
            products_categories_module_1.ProductsCategoriesModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            services_module_1.ServicesModule,
            quotes_module_1.QuotesModule,
            requests_module_1.RequestsModule,
            suppliers_module_1.SuppliersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map