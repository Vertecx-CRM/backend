import { OrdersServices } from 'src/orders-services/entities/orders-services.entity';
import { ServiceRequest } from 'src/requests/entities/servicerequest.entity';
import { States } from 'src/shared/entities/states.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuoteDetail } from './quotedetail.entity';

@Entity('quotes')
export class Quotes {
  @PrimaryGeneratedColumn()
  quotesid: number;

  @Column({ nullable: true })
  ordersservicesid: number;

  @ManyToOne(() => OrdersServices, { nullable: true })
  @JoinColumn({ name: 'ordersservicesid' })
  ordersservices: OrdersServices;

  @Column({ name: 'servicerequestid', nullable: false })
  serviceRequestId: number;

  @ManyToOne(() => ServiceRequest, { nullable: false })
  @JoinColumn({ name: 'servicerequestid' })
  serviceRequest: ServiceRequest;

  @Column({ name: 'statesid', nullable: false })
  statesid: number;

  @ManyToOne(() => States, { nullable: false })
  @JoinColumn({ name: 'statesid' })
  state: States;

  @Column({ nullable: true })
  observation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  servicetype: string;

  @Column({ type: 'int', nullable: true })
  customerid: number;

  @Column({ type: 'int', nullable: true })
  technicianid: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  subtotal: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  tax: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  total: number;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @OneToMany(() => QuoteDetail, (qd) => qd.quote, { cascade: true })
  details: QuoteDetail[];
}
