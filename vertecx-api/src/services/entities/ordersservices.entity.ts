import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('ordersservices')
export class Ordersservices {
  @Column({ nullable: false })
  ordersservicesid: number;

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  total: number;

  @Column({ nullable: true })
  clientid: number;

  @Column({ nullable: true })
  stateid: number;

  @Column({ nullable: true })
  productorderid: number;

  @Column({ nullable: true })
  technicalid: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  files: string;

  @ManyToOne(() => Customers)
  @JoinColumn({ name: 'clientid' })
  customers: Customers;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

  @ManyToOne(() => Technicians)
  @JoinColumn({ name: 'technicalid' })
  technicians: Technicians;

}
