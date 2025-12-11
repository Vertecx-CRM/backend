import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrdersServices } from './orders-services.entity';
import { Users } from 'src/users/entities/users.entity';

@Entity({ name: 'ordersservices_warranty' })
export class OrdersServicesWarranty {
  @PrimaryGeneratedColumn({ name: 'warrantyid', type: 'int' })
  warrantyid: number;

  @OneToOne(() => OrdersServices, (o) => o.warrantyRecord, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordersservicesid', referencedColumnName: 'ordersservicesid' })
  order: OrdersServices;

  @Column({ name: 'label', type: 'text', nullable: true })
  label: string | null;

  @Column({ name: 'details', type: 'text', nullable: true })
  details: string | null;

  @Column({ name: 'notifiedclient', type: 'boolean', default: false })
  notifiedclient: boolean;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reportedbyuserid', referencedColumnName: 'userid' })
  reportedBy: Users | null;

  @Column({ name: 'reportedat', type: 'timestamptz', nullable: true })
  reportedat: Date | null;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdat: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz' })
  updatedat: Date;
}
