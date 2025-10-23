import { Users } from 'src/users/entities/users.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { States } from './states.entity';

@Entity('suppliers')
export class Suppliers {
  @Column({ nullable: false })
  supplierid: number;

  @Column({ nullable: false })
  userid: number;

  @Column({ nullable: false })
  stateid: number;

  @Column({ nullable: false })
  nit: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: false })
  companyname: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userid' })
  users: Users;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;
}
