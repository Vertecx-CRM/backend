import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrdersServicesProducts } from './orders-services-products.entity';
import { OrdersServicesHistory } from './orders-services-history.entity';
import { OrdersServicesServices } from './orders-services-services.entity';
import { OrdersServicesWarranty } from './orders-services-warranty.entity';

import { Customers } from 'src/customers/entities/customers.entity';
import { States } from 'src/shared/entities/states.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';

@Entity({ name: 'ordersservices' })
export class OrdersServices {
  @PrimaryGeneratedColumn({ name: 'ordersservicesid', type: 'int' })
  ordersservicesid: number;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'total', type: 'int', default: 0 })
  total: number;

  @Column({ name: 'viaticos', type: 'int', default: 0 })
  viaticos: number;

  @Column({ name: 'files', type: 'jsonb', default: () => "'[]'::jsonb" })
  files: string[];

  @Column({ name: 'fechainicio', type: 'date' })
  fechainicio: Date;

  @Column({ name: 'fechafin', type: 'date' })
  fechafin: Date;

  @Column({ name: 'horainicio', type: 'time' })
  horainicio: string;

  @Column({ name: 'horafin', type: 'time' })
  horafin: string;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdat: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz' })
  updatedat: Date;

  @ManyToOne(() => Customers, { nullable: false })
  @JoinColumn({ name: 'clientid' })
  client: Customers;

  @ManyToOne(() => States, { nullable: false })
  @JoinColumn({ name: 'stateid' })
  state: States;

  @OneToMany(() => OrdersServicesProducts, (p) => p.order)
  products: OrdersServicesProducts[];

  @OneToMany(() => OrdersServicesServices, (s) => s.order)
  services: OrdersServicesServices[];

  @ManyToMany(() => Technicians)
  @JoinTable({
    name: 'ordersservices_technicians',
    joinColumn: { name: 'ordersservicesid', referencedColumnName: 'ordersservicesid' },
    inverseJoinColumn: { name: 'technicianid', referencedColumnName: 'technicianid' },
  })
  technicians: Technicians[];

  @OneToMany(() => OrdersServicesHistory, (h) => h.order)
  history: OrdersServicesHistory[];

  @OneToOne(() => OrdersServicesWarranty, (w) => w.order)
  warrantyRecord: OrdersServicesWarranty;
}
