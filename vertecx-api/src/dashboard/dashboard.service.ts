import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customers } from "src/customers/entities/customers.entity";
import { ProductCategory } from "src/products-categories/entities/product-category.entity";
import { Products } from "src/products/entities/products.entity";
import { Purchasesmanagement } from "src/purchases/entities/purchasesmanagement.entity";
import { Sales } from "src/sales/entities/sales.entity";
import { OrdersServices } from "src/orders-services/entities/orders-services.entity";
import { ServiceRequest } from "src/requests/entities/servicerequest.entity";
import { Repository } from "typeorm";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sales) private salesRepo: Repository<Sales>,
    @InjectRepository(Purchasesmanagement) private purchasesRepo: Repository<Purchasesmanagement>,
    @InjectRepository(ProductCategory) private categoryRepo: Repository<ProductCategory>,
    @InjectRepository(Products) private productRepo: Repository<Products>,
    @InjectRepository(OrdersServices) private orderRepo: Repository<OrdersServices>,
    @InjectRepository(Customers) private customerRepo: Repository<Customers>,
    @InjectRepository(ServiceRequest) private serviceRequestsRepo: Repository<ServiceRequest>
  ) { }


  //  VALIDACION DE AÑO
  private validateYear(year?: number): number | null {
    if (year === undefined || year === null || year === 0) return null;

    if (typeof year !== "number" || year < 2000 || year > 2100) {
      throw new BadRequestException("El año es inválido.");
    }

    return year;
  }


  //  VENTAS POR MES

  async getSalesByMonth(year?: number) {
    const y = this.validateYear(year);

    return this.salesRepo
      .createQueryBuilder("s")
      .select("TO_CHAR(s.saledate, 'Mon')", "month")
      .addSelect("SUM(s.totalamount)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM s.saledate) = :year", { year: y })
      .groupBy("month")
      .orderBy("MIN(s.saledate)")
      .getRawMany();
  }


  //  TOTAL VENTAS

  async getTotalSales(year?: number) {
    const y = this.validateYear(year);

    const result = await this.salesRepo
      .createQueryBuilder("s")
      .select("SUM(s.totalamount)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM s.saledate) = :year", { year: y })
      .getRawOne();

    return { total: Number(result.total) || 0 };
  }


  //  VENTAS DIARIAS POR MES

  async getDailySalesByMonth(month: number, year?: number) {
    const y = this.validateYear(year);

    return this.salesRepo
      .createQueryBuilder("s")
      .select("EXTRACT(DAY FROM s.saledate)", "day")
      .addSelect("SUM(s.totalamount)", "total")
      .where("EXTRACT(MONTH FROM s.saledate) = :month", { month })
      .andWhere("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM s.saledate) = :year", { year: y })
      .groupBy("day")
      .orderBy("day")
      .getRawMany();
  }


  // COMPRAS POR MES
  async getPurchasesByMonth(year?: number) {
    const y = this.validateYear(year);

    return this.purchasesRepo
      .createQueryBuilder("p")
      .select("TO_CHAR(p.createdat, 'Mon')", "month")
      .addSelect("SUM(p.amount)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM p.createdat) = :year", { year: y })
      .groupBy("month")
      .orderBy("MIN(p.createdat)")
      .getRawMany();
  }


  //  TOTAL COMPRAS
  async getTotalPurchases(year?: number) {
    const y = this.validateYear(year);

    const result = await this.purchasesRepo
      .createQueryBuilder("p")
      .select("SUM(p.amount)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM p.createdat) = :year", { year: y })
      .getRawOne();

    return { total: Number(result.total) || 0 };
  }

  //  COMPRAS DIARIAS POR MES

  async getDailyPurchasesByMonth(month: number, year?: number) {
    const y = this.validateYear(year);

    return this.purchasesRepo
      .createQueryBuilder("p")
      .select("EXTRACT(DAY FROM p.createdat)", "day")
      .addSelect("SUM(p.amount)", "total")
      .where("EXTRACT(MONTH FROM p.createdat) = :month", { month })
      .andWhere("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM p.createdat) = :year", { year: y })
      .groupBy("day")
      .orderBy("day")
      .getRawMany();
  }

 
  // PRODUCTOS POR CATEGORIA
  async getCategoryProducts(year?: number) {
    const y = this.validateYear(year);

    return this.categoryRepo
      .createQueryBuilder("c")
      .select("c.categoryname", "category")
      .addSelect("COUNT(p.productid)", "value")
      .leftJoin(Products, "p", "p.categoryid = c.categoryid")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM p.createddate) = :year", { year: y })
      .groupBy("c.categoryname")
      .getRawMany();
  }


  //  ÓRDENES POR ESTADO

  async getOrdersByState(year?: number) {
    const y = this.validateYear(year);

    return this.orderRepo
      .createQueryBuilder("o")
      .innerJoin("states", "st", "st.stateid = o.stateid")
      .select("st.name", "state")
      .addSelect("COUNT(o.ordersservicesid)", "value")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM o.createdat) = :year", { year: y })
      .groupBy("st.name")
      .orderBy("st.name")
      .getRawMany();
  }



  // TOTAL ÓRDENES
  async getTotalOrders(year?: number) {
    const y = this.validateYear(year);

    const result = await this.orderRepo
      .createQueryBuilder("o")
      .select("COUNT(o.ordersservicesid)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM o.createdat) = :year", { year: y })
      .getRawOne();

    return { total: Number(result.total) || 0 };
  }


  // CLIENTES POR MES
  async getClientsByMonth(year?: number) {
    const y = this.validateYear(year);

    return this.customerRepo
      .createQueryBuilder("c")
      .innerJoin("users", "u", "u.userid = c.userid")
      .select("TO_CHAR(u.createat, 'Mon')", "month")
      .addSelect("COUNT(*)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM u.createat) = :year", { year: y })
      .groupBy("month")
      .orderBy("MIN(u.createat)")
      .getRawMany();
  }



  //  TOTAL CLIENTES
  async getTotalClients(year?: number) {
    const y = this.validateYear(year);

    const result = await this.customerRepo
      .createQueryBuilder("c")
      .innerJoin("users", "u", "u.userid = c.userid")
      .select("COUNT(*)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM u.createat) = :year", { year: y })
      .getRawOne();

    return { total: Number(result.total) || 0 };
  }



  //  CLIENTES DIARIOS POR MES
  async getDailyClientsByMonth(month: number, year?: number) {
    const y = this.validateYear(year);

    return this.customerRepo
      .createQueryBuilder("c")
      .innerJoin("users", "u", "u.userid = c.userid")
      .select("EXTRACT(DAY FROM u.createat)", "day")
      .addSelect("COUNT(*)", "total")
      .where("EXTRACT(MONTH FROM u.createat) = :month", { month })
      .andWhere("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM u.createat) = :year", { year: y })
      .groupBy("day")
      .orderBy("day")
      .getRawMany();
  }


  //  SOLICITUDES POR ESTADO
  async getServiceRequestsByState(year?: number) {
    const y = year ?? null;

    return this.serviceRequestsRepo
      .createQueryBuilder("sr")
      .innerJoin("states", "st", "st.stateid = sr.stateid")
      .select("st.name", "state")
      .addSelect("COUNT(sr.servicerequestid)", "value")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM sr.createdat) = :year", { year: y })
      .groupBy("st.name")
      .orderBy("st.name")
      .getRawMany();
  }



  //  TOTAL SOLICITUDES
  async getTotalServiceRequests(year?: number) {
    const y = this.validateYear(year);

    const result = await this.serviceRequestsRepo
      .createQueryBuilder("sr")
      .select("COUNT(sr.servicerequestid)", "total")
      .where("(CAST(:year AS INT) IS NULL) OR EXTRACT(YEAR FROM sr.createdat) = :year", { year: y })
      .getRawOne();

    return { total: Number(result.total) || 0 };
  }
}
