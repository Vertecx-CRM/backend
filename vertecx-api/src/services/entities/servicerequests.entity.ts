import { States } from 'src/shared/entities/states.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Services } from './services.entity';
import { Customers } from 'src/customers/entities/customers.entity';

@Entity('servicerequests')
export class Servicerequests {
  @Column({ nullable: true })
  clientid: number;

  @Column({ nullable: true })
  scheduledat: Date;

  @Column({ nullable: true })
  serviceid: number;

  @Column({ nullable: false })
  servicerequestid: number;

  @Column({ nullable: true })
  createdat: Date;

  @Column({ nullable: true })
  stateid: number;

  @Column({ nullable: true })
  servicetype: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

  @ManyToOne(() => Services)
  @JoinColumn({ name: 'serviceid' })
  services: Services;

  @ManyToOne(() => Customers)
  @JoinColumn({ name: 'clientid' })
  customers: Customers;
}
