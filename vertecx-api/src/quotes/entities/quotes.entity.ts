import { Customers } from "src/customers/entities/customers.entity";
import { OrdersServices } from "src/orders-services/entities/orders-services.entity";
import { ServiceRequest } from "src/requests/entities/servicerequest.entity";
import { States } from "src/shared/entities/states.entity";
import { Technicians } from "src/technicians/entities/technicians.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { QuoteDetail } from "./quotedetail.entity";

@Entity('quotes')
export class Quotes {
  @PrimaryGeneratedColumn()
  quotesid: number;

  /* ---------- Relaciones principales ---------- */

  @Column({ name: 'servicerequestid', type: 'int' })
  serviceRequestId: number;

  @ManyToOne(() => ServiceRequest)
  @JoinColumn({ name: 'servicerequestid' })
  serviceRequest: ServiceRequest;

  @Column({ name: 'ordersservicesid', type: 'int', nullable: true })
  ordersservicesid: number;

  @ManyToOne(() => OrdersServices, { nullable: true })
  @JoinColumn({ name: 'ordersservicesid' })
  ordersservices: OrdersServices;

  @Column({ name: 'customerid', type: 'int' })
  customerid: number;

  @ManyToOne(() => Customers)
  @JoinColumn({ name: 'customerid' })
  customer: Customers;

  @Column({ name: 'technicianid', type: 'int' })
  technicianid: number;

  @ManyToOne(() => Technicians)
  @JoinColumn({ name: 'technicianid' })
  technician: Technicians;

  @Column({ name: 'statesid', type: 'int' })
  statesid: number;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'statesid' })
  state: States;

  /* ---------- Datos de negocio ---------- */

  @Column({ nullable: true })
  observation: string;

  @Column({ type: 'varchar', length: 50 })
  servicetype: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  tax: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: number;

  /* ---------- Auditoría ---------- */

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  /* ---------- Detalle ---------- */

  @OneToMany(() => QuoteDetail, (qd) => qd.quote, { cascade: true })
  details: QuoteDetail[];
}
