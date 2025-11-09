import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customers } from 'src/customers/entities/customers.entity';
import { Services } from 'src/services/entities/services.entity';
import { States } from 'src/shared/entities/states.entity';

@Entity({ name: 'servicerequests' })
@Index(['stateId', 'scheduledAt'])
@Index(['clientId', 'stateId'])
export class ServiceRequest {
  @PrimaryGeneratedColumn({ name: 'servicerequestid', type: 'int' })
  serviceRequestId: number;

  @Column({ name: 'scheduledat', type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'servicetype', type: 'varchar', length: 255 })
  serviceType: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'createdat', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'stateid', type: 'int' })
  stateId: number;

  @ManyToOne(() => States, { eager: false })
  @JoinColumn({ name: 'stateid' })
  state: States;

  @Column({ name: 'serviceid', type: 'int' })
  serviceId: number;

  @ManyToOne(() => Services, { eager: false })
  @JoinColumn({ name: 'serviceid' })
  service: Services;

  @Column({ name: 'clientid', type: 'int' })
  clientId: number;

  @ManyToOne(() => Customers, { eager: false })
  @JoinColumn({ name: 'clientid' })
  customer: Customers;
}
