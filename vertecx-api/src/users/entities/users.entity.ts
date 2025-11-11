import { Customers } from 'src/customers/entities/customers.entity';
import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';
import { States } from 'src/shared/entities/states.entity';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  userid: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastname: string;

  @Column({ nullable: false })
  documentnumber: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  createat: Date;

  @Column({ nullable: true })
  updateat: Date;

  @Column({ nullable: false })
  typeid: number;

  @Column({ nullable: false })
  stateid: number;

  @Column({ nullable: false })
  roleconfigurationid: number;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

  @ManyToOne(() => Typeofdocuments)
  @JoinColumn({ name: 'typeid' })
  typeofdocuments: Typeofdocuments;

  @ManyToOne(() => Roleconfiguration, (roleconfiguration) => roleconfiguration.users)
  @JoinColumn({ name: 'roleconfigurationid' })
  roleconfiguration: Roleconfiguration;

  @OneToMany(() => Technicians, technician => technician.users)
  technicians: Technicians[];

  @OneToMany(() => Customers, customer => customer.users)
  customers: Customers[];
}
