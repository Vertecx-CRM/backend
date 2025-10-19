import { Suppliers } from 'src/shared/entities/suppliers.entity';
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

  @ManyToOne(() => Suppliers)
  @JoinColumn({ name: 'supplierid' })
  suppliers: Suppliers;

  @ManyToOne(() => Productcategories)
  @JoinColumn({ name: 'categoryid' })
  productcategories: Productcategories;
}
