import { States } from 'src/shared/entities/states.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('customers')
export class Customers {
  @PrimaryGeneratedColumn()
  customerid: number;

  @Column({ nullable: false })
  userid: number;

  @Column({ nullable: false })
  stateid: number;

  @Column({ nullable: true })
  customeraddress: string;

  @Column({ nullable: true })
  customercity: string;

  @Column({ nullable: true })
  customerzipcode: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userid' })
  users: Users;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;
}
