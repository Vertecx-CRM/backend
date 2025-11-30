import { Injectable } from "@nestjs/common";
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

  // VENTAS POR MES
  async getSalesByMonth() {
    return this.salesRepo.query(`
    SELECT 
      TO_CHAR(saledate, 'Mon') AS month,
      SUM(totalamount) AS total
    FROM sales
    GROUP BY month
    ORDER BY MIN(saledate);
  `);
  }


  // TOTAL DE VENTAS
  async getTotalSales() {
    const result = await this.salesRepo
      .createQueryBuilder('s')
      .select('SUM(s.totalamount)', 'total')
      .getRawOne();

    return { total: Number(result.total) || 0 };
  }

  // VENTAS DIARIAS POR MES
  async getDailySalesByMonth(month: number) {
    return this.salesRepo.query(`
    SELECT
      EXTRACT(DAY FROM saledate) AS day,
      SUM(totalamount) AS total
    FROM sales
    WHERE EXTRACT(MONTH FROM saledate) = $1
    GROUP BY day
    ORDER BY day;
  `, [month]);
  }


  // COMPRAS POR MES
  async getPurchasesByMonth() {
    return this.purchasesRepo.query(`
    SELECT 
      TO_CHAR(createdat, 'Mon') AS month,
      SUM(amount) AS total
    FROM purchasesmanagement
    GROUP BY month
    ORDER BY MIN(createdat);
  `);
  }


  // TOTAL DE COMPRAS
  async getTotalPurchases() {
    const result = await this.purchasesRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .getRawOne();

    return { total: Number(result.total) || 0 };
  }

  // COMPRAS DIARIAS POR MES
  async getDailyPurchasesByMonth(month: number) {
    return this.purchasesRepo.query(`
    SELECT
      EXTRACT(DAY FROM createdat) AS day,
      SUM(amount) AS total
    FROM purchasesmanagement
    WHERE EXTRACT(MONTH FROM createdat) = $1
    GROUP BY day
    ORDER BY day;
  `, [month]);
  }


  // PRODUCTOS POR CATEGORÍA
  async getCategoryProducts() {
    return this.categoryRepo.query(`
    SELECT 
      c.categoryname AS category,
      COUNT(p.productid) AS value
    FROM categories c
    LEFT JOIN products p ON p.categoryid = c.categoryid
    GROUP BY c.categoryname;
  `);
  }


  // ÓRDENES POR ESTADO
  async getOrdersByState() {
    return this.orderRepo.query(`
    SELECT 
      st.name AS state,
      COUNT(o.ordersservicesid) AS value
    FROM ordersservices o
    JOIN states st ON st.stateid = o.stateid
    GROUP BY st.name
    ORDER BY st.name;
  `);
  }


  // TOTAL ÓRDENES
  async getTotalOrders() {
    const result = await this.orderRepo.count();
    return { total: result };
  }

  // CLIENTES POR MES
  async getClientsByMonth() {
    return this.customerRepo.query(`
    SELECT
      TO_CHAR(u.createat, 'Mon') AS month,
      COUNT(*) AS total
    FROM customers c
    JOIN users u ON u.userid = c.userid
    GROUP BY month
    ORDER BY MIN(u.createat);
  `);
  }

  // TOTAL CLIENTES
  async getTotalClients() {
    const result = await this.customerRepo.count();
    return { total: result };
  }

  // CLIENTES REGISTRADOS POR DÍA
  async getDailyClientsByMonth(month: number) {
    return this.customerRepo.query(`
    SELECT
      EXTRACT(DAY FROM u.createat) AS day,
      COUNT(*) AS total
    FROM customers c
    JOIN users u ON u.userid = c.userid
    WHERE EXTRACT(MONTH FROM u.createat) = $1
    GROUP BY day
    ORDER BY day;
  `, [month]);
  }


  // SOLICITUDES DE SERVICIO POR ESTADO
  async getServiceRequestsByState() {
    return this.serviceRequestsRepo.query(`
    SELECT 
      st.name AS state,
      COUNT(sr.servicerequestid) AS value
    FROM servicerequests sr
    JOIN states st ON st.stateid = sr.stateid
    GROUP BY st.name
    ORDER BY st.name;
  `);
  }


  // TOTAL SOLICITUDES
  async getTotalServiceRequests() {
    const result = await this.customerRepo
      .query(`SELECT COUNT(*) AS total FROM servicerequests;`);
    return { total: Number(result[0].total) };
  }


}
