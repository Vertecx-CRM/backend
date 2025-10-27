import { Sales } from './sales.entity';
import { Products } from 'src/products/entities/products.entity';
export declare class Salesdetail {
    saledetailid: number;
    saleid: number;
    productid: number;
    quantity: number;
    unitprice: number;
    linetotal: number;
    discountpercent: number;
    discountamount: number;
    notes: string;
    sales: Sales;
    products: Products;
}
