import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Products } from './products.entity';
import { Ordersservices } from 'src/services/entities/ordersservices.entity';

@Entity('ordersproducts')
export class Ordersproducts {
  @PrimaryGeneratedColumn()
  ordersproductsid: number;

  @Column({ nullable: true })
  productid: number;

  @Column({ nullable: true })
  ordersid: number;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'productid' })
  products: Products;

  @ManyToOne(() => Ordersservices)
  @JoinColumn({ name: 'ordersid' })
  ordersservices: Ordersservices;
}
