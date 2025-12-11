import { Customers } from 'src/customers/entities/customers.entity';
import { Roles } from 'src/roles/entities/roles.entity';
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

  @Column({ nullable: true })
  lastname: string;

  @Column({ nullable: false })
  documentnumber: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ name: 'mustchangepassword', type: 'boolean', default: true })
  mustchangepassword: boolean;

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
  roleid: number;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

  @ManyToOne(() => Typeofdocuments)
  @JoinColumn({ name: 'typeid' })
  typeofdocuments: Typeofdocuments;

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn({ name: 'roleid' })
  roles: Roles;

  @OneToMany(() => Technicians, technician => technician.users)
  technicians: Technicians[];

  @OneToMany(() => Customers, customer => customer.users)
  customers: Customers[];
}
