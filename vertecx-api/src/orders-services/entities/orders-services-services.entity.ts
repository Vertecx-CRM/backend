import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrdersServices } from './orders-services.entity';
import { Services } from 'src/services/entities/services.entity';

@Entity({ name: 'ordersservicesservices' })
export class OrdersServicesServices {
  @PrimaryGeneratedColumn({ name: 'ordersservicesservicesid', type: 'int' })
  ordersservicesservicesid: number;

  @ManyToOne(() => OrdersServices, (o) => o.services, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'ordersservicesid' })
  order: OrdersServices;

  @ManyToOne(() => Services, { nullable: false })
  @JoinColumn({ name: 'serviceid' })
  service: Services;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad: number;

  @Column({ name: 'unitprice', type: 'int' })
  unitprice: number;

  @Column({ name: 'subtotal', type: 'int' })
  subtotal: number;
}
