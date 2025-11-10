import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Productcategories } from './productcategories.entity';
import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';

@Entity('products')
export class Products {
  @Column({ nullable: true })
  createddate: string;

  @Column({ nullable: true })
  categoryid: number;

  @Column({ nullable: true })
  isactive: string;

  @PrimaryGeneratedColumn()
  productid: number;

  @Column({ nullable: true })
  productpriceofsale: number;

  @Column({ nullable: false })
  productpriceofsupplier: number;

  @Column({ nullable: true })
  productstock: number;

  @Column({ nullable: false })
  productname: string;

  @Column({ nullable: true })
  productdescription: string;

  @Column({ nullable: true })
  productcode: string;

  @ManyToOne(() => Productcategories)
  @JoinColumn({ name: 'categoryid' })
  productcategories: Productcategories;

  @OneToMany(
    () => PurchaseProduct,
    (purchaseProduct) => purchaseProduct.product,
  )
  purchaseProducts: PurchaseProduct[];
}
