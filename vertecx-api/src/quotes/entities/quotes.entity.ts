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

  // -----------------------------
  // FK → ORDEN DE SERVICIO (opcional cuando aún no se crea la orden)
  // -----------------------------
  @Column({ nullable: true })
  ordersservicesid: number;

  @ManyToOne(() => OrdersServices, { nullable: true })
  @JoinColumn({ name: 'ordersservicesid' })
  ordersservices: OrdersServices;

  // -----------------------------
  // FK → SOLICITUD (OBLIGATORIO)
  // -----------------------------
  @Column({ name: 'servicerequestid', nullable: false })
  serviceRequestId: number;

  @ManyToOne(() => ServiceRequest, { nullable: false })
  @JoinColumn({ name: 'servicerequestid' })
  serviceRequest: ServiceRequest;

  // -----------------------------
  // ESTADO DE LA COTIZACIÓN
  // -----------------------------
  @Column({ name: 'statesid', nullable: false })
  statesid: number;

  @ManyToOne(() => States, { nullable: false })
  @JoinColumn({ name: 'statesid' })
  state: States;

  // -----------------------------
  // OBSERVACIONES
  // -----------------------------
  @Column({ nullable: true })
  observation: string;

  // JSON con totales, tipo servicio, cliente, etc.
  @Column({ type: 'jsonb', nullable: true })
  quotedata: any;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  // -----------------------------
  // DETALLES DE LA COTIZACIÓN
  // -----------------------------
  @OneToMany(() => QuoteDetail, (qd) => qd.quote, { cascade: true })
  details: QuoteDetail[];
}
