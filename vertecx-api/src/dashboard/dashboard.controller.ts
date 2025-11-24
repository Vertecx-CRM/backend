import { Controller, Get, Param } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) { }

  @Get('sales/year')
  getSalesYear() {
    return this.service.getSalesByMonth();
  }

  @Get('sales/total')
  getSalesTotal() {
    return this.service.getTotalSales();
  }

  @Get('sales/month/:month')
  getDailySales(@Param('month') month: string) {
    return this.service.getDailySalesByMonth(Number(month));
  }
  

  @Get('purchases/year')
  getPurchasesYear() {
    return this.service.getPurchasesByMonth();
  }

  @Get('purchases/total')
  getPurchasesTotal() {
    return this.service.getTotalPurchases();
  }

  @Get('purchases/month/:month')
  getDailyPurchases(@Param('month') month: string) {
    return this.service.getDailyPurchasesByMonth(Number(month));
  }

  @Get('categories/products')
  getCategoryProducts() {
    return this.service.getCategoryProducts();
  }

  @Get('orders/state')
  getOrdersState() {
    return this.service.getOrdersByState();
  }

  @Get('orders/total')
  getOrdersTotal() {
    return this.service.getTotalOrders();
  }

  @Get('clients/year')
  getClientsYear() {
    return this.service.getClientsByMonth();
  }

  @Get('clients/total')
  getClientsTotal() {
    return this.service.getTotalClients();
  }

  @Get('clients/month/:month')
  getDailyClients(@Param('month') month: string) {
    return this.service.getDailyClientsByMonth(Number(month));
  }

  @Get('service-requests/state')
  getServiceRequestsState() {
    return this.service.getServiceRequestsByState();
  }

  @Get('service-requests/total')
  getServiceRequestsTotal() {
    return this.service.getTotalServiceRequests();
  }
}
