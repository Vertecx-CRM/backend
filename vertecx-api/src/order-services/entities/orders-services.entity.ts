import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

import { Customers } from 'src/customers/entities/customers.entity';
import { States } from 'src/shared/entities/states.entity';
import { OrdersServicesProducts } from './orders-services-products.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';

export class CloudinaryFile {
  url: string;
  public_id: string;
  resource_type: string;
  size: number;
}

@Entity('OrdersServices')
export class OrdersServices {

  @PrimaryGeneratedColumn({ name: 'OrdersServicesId', type: 'int' })
  ordersservicesid: number;

  @Column({ name: 'Description', type: 'text', nullable: false })
  description: string;

  @Column({ name: 'Total', type: 'int', default: 0 })
  total: number;

  @Column({ name: 'Files', type: 'jsonb', nullable: true })
  files: CloudinaryFile[];

  @ManyToOne(() => Customers)
  @JoinColumn({ name: 'ClientId' })
  client: Customers;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'StateId' })
  state: States;

  @Column({ name: 'FechaInicio', type: 'date', nullable: false })
  fechainicio: Date;

  @Column({ name: 'FechaFin', type: 'date', nullable: false })
  fechafin: Date;

  @Column({ name: 'HoraInicio', type: 'time', nullable: false })
  horainicio: string;

  @Column({ name: 'HoraFin', type: 'time', nullable: false })
  horafin: string;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdat: Date;

  @UpdateDateColumn({ name: 'UpdatedAt' })
  updatedat: Date;

  @OneToMany(
    () => OrdersServicesProducts,
    (prod) => prod.order,
    { cascade: true },
  )
  products: OrdersServicesProducts[];

  // Múltiples técnicos
  @ManyToMany(() => Technicians)
  @JoinTable({
    name: 'OrdersServices_Technicians',
    joinColumn: { name: 'OrdersServicesId', referencedColumnName: 'ordersservicesid' },
    inverseJoinColumn: { name: 'TechnicianId', referencedColumnName: 'technicianid' },
  })
  technicians: Technicians[];
}
