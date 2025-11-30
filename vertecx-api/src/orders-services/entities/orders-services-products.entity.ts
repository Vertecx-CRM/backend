import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrdersServices } from './orders-services.entity';
import { Products } from 'src/products/entities/products.entity';

@Entity({ name: 'ordersservicesproducts' })
export class OrdersServicesProducts {
  @PrimaryGeneratedColumn({ name: 'ordersservicesproductsid', type: 'int' })
  ordersservicesproductsid: number;

  @ManyToOne(() => OrdersServices, (o) => o.products, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'ordersservicesid' })
  order: OrdersServices;

  @ManyToOne(() => Products, { nullable: false })
  @JoinColumn({ name: 'productid' })
  product: Products;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad: number;

  @Column({ name: 'subtotal', type: 'int' })
  subtotal: number;
}
