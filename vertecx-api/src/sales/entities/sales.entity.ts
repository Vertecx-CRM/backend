import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Salesdetail } from './salesdetail.entity';

@Entity('sales')
export class Sales {
  @PrimaryGeneratedColumn()
  saleid: number;

  @Column({ nullable: false })
  subtotal: number;

  @Column({ nullable: true })
  taxamount: number;

  @Column({ nullable: true })
  discountamount: number;

  @Column({ nullable: false })
  totalamount: number;

  @Column({ nullable: true })
  createddate: string;

  @Column({ nullable: false })
  saledate: Date;

  @Column({ nullable: false })
  customerid: number;

  @Column({ nullable: false })
  salecode: string;

  @Column({ nullable: true })
  createdby: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  paymentmethod: string;

  @Column({ nullable: true })
  salestatus: string;

  @OneToMany(() => Salesdetail, (detail) => detail.sales)
  salesdetail: Salesdetail[];
}
