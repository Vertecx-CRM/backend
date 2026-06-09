import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrdersServices } from './orders-services.entity';
import { Products } from 'src/products/entities/products.entity';
import type { OrderProductAvailability } from '../utils/order-materials';

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

  @Column({ name: 'availability', type: 'varchar', length: 20, default: 'DISPONIBLE' })
  availability: OrderProductAvailability;

  @Column({ name: 'stockcoveredquantity', type: 'int', default: 0 })
  stockcoveredquantity: number;

  @Column({ name: 'backorderquantity', type: 'int', default: 0 })
  backorderquantity: number;

  @Column({ name: 'specification', type: 'text', nullable: true })
  specification: string | null;

  @Column({ name: 'manualentry', type: 'boolean', default: false })
  manualentry: boolean;

  @Column({ name: 'subtotal', type: 'int' })
  subtotal: number;
}
