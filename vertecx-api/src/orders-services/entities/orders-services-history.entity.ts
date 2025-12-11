import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrdersServices } from './orders-services.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';

export type OrdersServicesHistoryType = 'SYSTEM' | 'TECH' | 'NOTE' | 'STATUS';

@Entity({ name: 'ordersserviceshistory' })
export class OrdersServicesHistory {
  @PrimaryGeneratedColumn({ name: 'ordersserviceshistoryid', type: 'int' })
  ordersserviceshistoryid: number;

  @ManyToOne(() => OrdersServices, (order) => order.history, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'ordersservicesid', referencedColumnName: 'ordersservicesid' })
  order: OrdersServices;

  @ManyToOne(() => Technicians, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'technicianid', referencedColumnName: 'technicianid' })
  technician: Technicians | null;

  @Column({ name: 'actoruserid', type: 'int', nullable: true })
  actoruserid: number | null;

  @Column({ name: 'type', type: 'varchar', length: 30, default: () => "'NOTE'" })
  type: OrdersServicesHistoryType;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'progresspercent', type: 'int', nullable: true })
  progresspercent: number | null;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: any | null;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdat: Date;
}
