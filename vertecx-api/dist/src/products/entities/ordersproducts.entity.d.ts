import { Products } from './products.entity';
import { Ordersservices } from 'src/services/entities/ordersservices.entity';
export declare class Ordersproducts {
    ordersproductsid: number;
    productid: number;
    ordersid: number;
    products: Products;
    ordersservices: Ordersservices;
}
