import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Products } from './products.entity';
import { OrdersServices } from 'src/orders-services/entities/orders-services.entity';

@Entity('ordersproducts')
export class Ordersproducts {
  @PrimaryGeneratedColumn()
  ordersproductsid: number;

  @Column({ nullable: true })
  productid: number;

  @Column({ nullable: true })
  ordersid: number;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'productid' })
  products: Products;

  @ManyToOne(() => OrdersServices)
  @JoinColumn({ name: 'ordersid' })
  ordersservices: OrdersServices;
}
