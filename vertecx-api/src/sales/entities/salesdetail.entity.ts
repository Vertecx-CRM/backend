import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sales } from './sales.entity';
import { Products } from 'src/products/entities/products.entity';

@Entity('salesdetail')
export class Salesdetail {
  @PrimaryGeneratedColumn()
  saledetailid: number;

  @Column({ nullable: false })
  saleid: number;

  @Column({ nullable: false })
  productid: number;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false })
  unitprice: number;

  @Column({ nullable: false })
  linetotal: number;

  @Column({ nullable: true })
  discountpercent: number;

  @Column({ nullable: true })
  discountamount: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Sales)
  @JoinColumn({ name: 'saleid' })
  sales: Sales;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'productid' })
  products: Products;
}
