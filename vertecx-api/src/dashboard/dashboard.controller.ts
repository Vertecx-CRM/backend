import { Controller, Get, Param, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) { }

  @Get('sales/year')
  getSalesYear(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getSalesByMonth(parsedYear);
  }

  @Get('sales/total')
  getSalesTotal(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getTotalSales(parsedYear);
  }

  @Get('sales/month/:month')
  getDailySales(@Param('month') month: string, @Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getDailySalesByMonth(Number(month), parsedYear);
  }
  

  @Get('purchases/year')
  getPurchasesYear(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getPurchasesByMonth(parsedYear);
  }

  @Get('purchases/total')
  getPurchasesTotal(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getTotalPurchases(parsedYear);
  }

  @Get('purchases/month/:month')
  getDailyPurchases(@Param('month') month: string, @Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getDailyPurchasesByMonth(Number(month), parsedYear);
  }

  @Get('categories/products')
  getCategoryProducts(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getCategoryProducts(parsedYear);
  }

  @Get('orders/state')
  getOrdersState(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getOrdersByState(parsedYear);
  }

  @Get('orders/total')
  getOrdersTotal(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getTotalOrders(parsedYear);
  }

  @Get('clients/year')
  getClientsYear(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getClientsByMonth(parsedYear);
  }

  @Get('clients/total')
  getClientsTotal(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getTotalClients(parsedYear);
  }

  @Get('clients/month/:month')
  getDailyClients(@Param('month') month: string, @Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getDailyClientsByMonth(Number(month), parsedYear);
  }

  @Get('service-requests/state')
  getServiceRequestsState(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getServiceRequestsByState(parsedYear);
  }

  @Get('service-requests/total')
  getServiceRequestsTotal(@Query('year') year?: string) {
    const parsedYear = year ? Number(year) : undefined;
    return this.service.getTotalServiceRequests(parsedYear);
  }
}
