import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customers } from "src/customers/entities/customers.entity";
import { ProductCategory } from "src/products-categories/entities/product-category.entity";
import { Products } from "src/products/entities/products.entity";
import { Purchasesmanagement } from "src/purchases/entities/purchasesmanagement.entity";
import { Sales } from "src/sales/entities/sales.entity";
import { OrdersServices } from "src/order-services/entities/orders-services.entity";
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

  // VENTAS POR MES
  async getSalesByMonth(year?: number) {
    return this.salesRepo.query(`
      SELECT 
        TO_CHAR(saledate, 'Mon') AS month,
        SUM(totalamount) AS total
      FROM sales
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM saledate) = $1)
      GROUP BY month
      ORDER BY MIN(saledate);
    `, [year ?? null]);
  }

  // TOTAL DE VENTAS
  async getTotalSales(year?: number) {
    const result = await this.salesRepo.query(`
      SELECT SUM(totalamount) AS total
      FROM sales
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM saledate) = $1);
    `, [year ?? null]);

    return { total: Number(result[0].total) || 0 };
  }

  // VENTAS DIARIAS POR MES
  async getDailySalesByMonth(month: number, year?: number) {
    return this.salesRepo.query(`
      SELECT
        EXTRACT(DAY FROM saledate) AS day,
        SUM(totalamount) AS total
      FROM sales
      WHERE EXTRACT(MONTH FROM saledate) = $1
        AND ($2::int IS NULL OR EXTRACT(YEAR FROM saledate) = $2)
      GROUP BY day
      ORDER BY day;
    `, [month, year ?? null]);
  }

  // COMPRAS POR MES
  async getPurchasesByMonth(year?: number) {
    return this.purchasesRepo.query(`
      SELECT 
        TO_CHAR(createdat, 'Mon') AS month,
        SUM(amount) AS total
      FROM purchasesmanagement
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM createdat) = $1)
      GROUP BY month
      ORDER BY MIN(createdat);
    `, [year ?? null]);
  }

  // TOTAL DE COMPRAS
  async getTotalPurchases(year?: number) {
    const result = await this.purchasesRepo.query(`
      SELECT SUM(amount) AS total
      FROM purchasesmanagement
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM createdat) = $1);
    `, [year ?? null]);

    return { total: Number(result[0].total) || 0 };
  }

  // COMPRAS DIARIAS POR MES
  async getDailyPurchasesByMonth(month: number, year?: number) {
    return this.purchasesRepo.query(`
      SELECT
        EXTRACT(DAY FROM createdat) AS day,
        SUM(amount) AS total
      FROM purchasesmanagement
      WHERE EXTRACT(MONTH FROM createdat) = $1
        AND ($2::int IS NULL OR EXTRACT(YEAR FROM createdat) = $2)
      GROUP BY day
      ORDER BY day;
    `, [month, year ?? null]);
  }

  // PRODUCTOS POR CATEGORÍA
  async getCategoryProducts(year?: number) {
    return this.categoryRepo.query(`
    SELECT 
      c.categoryname AS category,
      COUNT(p.productid) AS value
    FROM categories c
    LEFT JOIN products p ON p.categoryid = c.categoryid
    WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM p.createddate) = $1)
    GROUP BY c.categoryname;
  `, [year ?? null]);
  }


  // ÓRDENES POR ESTADO
  async getOrdersByState(year?: number) {
    return this.orderRepo.query(`
      SELECT 
        st.name AS state,
        COUNT(o.ordersservicesid) AS value
      FROM ordersservices o
      JOIN states st ON st.stateid = o.stateid
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM o.createdat) = $1)
      GROUP BY st.name
      ORDER BY st.name;
    `, [year ?? null]);
  }

  // TOTAL ÓRDENES
  async getTotalOrders(year?: number) {
    const result = await this.orderRepo.query(`
      SELECT COUNT(*) AS total
      FROM ordersservices
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM createdat) = $1);
    `, [year ?? null]);

    return { total: Number(result[0].total) || 0 };
  }

  // CLIENTES POR MES
  async getClientsByMonth(year?: number) {
    return this.customerRepo.query(`
      SELECT
        TO_CHAR(u.createat, 'Mon') AS month,
        COUNT(*) AS total
      FROM customers c
      JOIN users u ON u.userid = c.userid
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM u.createat) = $1)
      GROUP BY month
      ORDER BY MIN(u.createat);
    `, [year ?? null]);
  }

  // TOTAL CLIENTES
  async getTotalClients(year?: number) {
    const result = await this.customerRepo.query(`
      SELECT COUNT(*) AS total
      FROM customers c
      JOIN users u ON u.userid = c.userid
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM u.createat) = $1);
    `, [year ?? null]);

    return { total: Number(result[0].total) || 0 };
  }

  // CLIENTES REGISTRADOS POR DÍA
  async getDailyClientsByMonth(month: number, year?: number) {
    return this.customerRepo.query(`
      SELECT
        EXTRACT(DAY FROM u.createat) AS day,
        COUNT(*) AS total
      FROM customers c
      JOIN users u ON u.userid = c.userid
      WHERE EXTRACT(MONTH FROM u.createat) = $1
      AND ($2::int IS NULL OR EXTRACT(YEAR FROM u.createat) = $2)
      GROUP BY day
      ORDER BY day;
    `, [month, year ?? null]);
  }

  // SOLICITUDES DE SERVICIO POR ESTADO
  async getServiceRequestsByState(year?: number) {
    return this.serviceRequestsRepo.query(`
      SELECT 
        st.name AS state,
        COUNT(sr.servicerequestid) AS value
      FROM servicerequests sr
      JOIN states st ON st.stateid = sr.stateid
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM sr.createdat) = $1)
      GROUP BY st.name
      ORDER BY st.name;
    `, [year ?? null]);
  }

  // TOTAL SOLICITUDES
  async getTotalServiceRequests(year?: number) {
    const result = await this.serviceRequestsRepo.query(`
      SELECT COUNT(*) AS total
      FROM servicerequests
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM createdat) = $1);
    `, [year ?? null]);

    return { total: Number(result[0].total) || 0 };
  }
}
