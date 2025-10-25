import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Productcategories } from './productcategories.entity';

@Entity('productsuppliers')
export class Productsuppliers {
  @Column({ nullable: false })
  productsupplierid: number;

  @Column({ nullable: false })
  supplierid: number;

  @Column({ nullable: false })
  categoryid: number;

  @ManyToOne(() => Productcategories)
  @JoinColumn({ name: 'categoryid' })
  productcategories: Productcategories;
}
