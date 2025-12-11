import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdersServices } from './orders-services.entity';

export type OrdersServicesHistoryAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ADD_PRODUCT'
  | 'REMOVE_PRODUCT'
  | 'ASSIGN_TECHNICIANS'
  | 'FINISH'
  | 'ADD_FILE'
  | 'REMOVE_FILE'
  | 'REPROGRAM';

@Entity('ordersserviceshistory')
export class OrdersServicesHistory {
  @PrimaryGeneratedColumn({ name: 'ordersserviceshistoryid' })
  ordersserviceshistoryid: number;

  @ManyToOne(() => OrdersServices, (order) => order.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordersservicesid', referencedColumnName: 'ordersservicesid' })
  order: OrdersServices;

  @Column({ name: 'action', type: 'varchar', length: 40 })
  action: OrdersServicesHistoryAction;

  @Column({ name: 'actionlabel', type: 'varchar', length: 120 })
  actionlabel: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'payload', type: 'jsonb', nullable: true })
  payload: any;

  @Column({ name: 'actoruserid', type: 'int', nullable: true })
  actoruserid: number | null;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdat: Date;
}
