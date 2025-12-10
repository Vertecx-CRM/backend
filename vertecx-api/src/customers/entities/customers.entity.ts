import { Sales } from 'src/sales/entities/sales.entity';
import { States } from 'src/shared/entities/states.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('customers')
export class Customers {
  @PrimaryGeneratedColumn()
  customerid: number;

  @Column({ nullable: false })
  userid: number;

  @Column({ nullable: true })
  customercity: string;

  @Column({ nullable: true })
  customerzipcode: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userid' })
  users: Users;

  @OneToMany(() => Sales, (sale) => sale.customer)
  sales: Sales[];
}
