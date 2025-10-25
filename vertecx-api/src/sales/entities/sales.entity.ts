import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
