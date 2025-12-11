import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Salesdetail } from './salesdetail.entity';
import { Customers } from 'src/customers/entities/customers.entity';

@Entity('sales')
export class Sales {
  @PrimaryGeneratedColumn()
  saleid: number;

  @Column({ nullable: false })
  salecode: string;

  @Column({ nullable: false })
  saledate: Date;

  @Column({ nullable: false })
  customerid: number;

  @Column({ nullable: false })
  subtotal: number;

  @Column({ nullable: true })
  taxamount: number;

  @Column({ nullable: true })
  discountamount: number;

  @Column({ nullable: false })
  totalamount: number;

  @Column({ nullable: true })
  paymentmethod: string; // 'Efectivo', 'Tarjeta', etc.

  @Column({ nullable: true })
  salestatus: string; // 'Pending' | 'Completed' | ...

  @Column({ nullable: true })
  createdby: string;

  @Column({ nullable: true })
  createddate: string;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => Salesdetail, (detail) => detail.sales)
  salesdetail: Salesdetail[];

  @ManyToOne(() => Customers, (customer) => customer.sales)
  @JoinColumn({ name: 'customerid', referencedColumnName: 'customerid' })
  customer: Customers;
}
