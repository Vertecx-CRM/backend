import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { OrdersServices } from './orders-services.entity';
import { Products } from 'src/products/entities/products.entity';

@Entity('OrdersServicesProducts')
export class OrdersServicesProducts {

  @PrimaryGeneratedColumn({ name: 'OrdersServicesProductsId', type: 'int' })
  ordersservicesproductsid: number;

  @ManyToOne(() => OrdersServices, (order) => order.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'OrdersServicesId' })
  order: OrdersServices;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'ProductId' })
  product: Products;

  @Column({ name: 'Cantidad', type: 'int', nullable: false })
  cantidad: number;

  @Column({ name: 'Subtotal', type: 'int', nullable: false })
  subtotal: number;
}
