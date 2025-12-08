import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';
import { OrdersServicesProducts } from 'src/orders-services/entities/orders-services-products.entity';
import { ProductCategory } from 'src/products-categories/entities/product-category.entity';

const numericTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('products')
export class Products {
  @PrimaryGeneratedColumn()
  productid: number;

  @CreateDateColumn({ name: 'createddate', type: 'timestamp' })
  createddate: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamp' })
  updatedat: Date;

  @Column({ name: 'categoryid', type: 'int', nullable: false })
  categoryid: number;

  @ManyToOne(() => ProductCategory, { eager: false })
  @JoinColumn({ name: 'categoryid', referencedColumnName: 'id' })
  category: ProductCategory;

  @Column({ name: 'isactive', type: 'boolean', default: true })
  isactive: boolean;

  @Column({
    name: 'productpriceofsale',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  productpriceofsale: number | null;

  @Column({
    name: 'productpriceofsupplier',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: numericTransformer,
  })
  productpriceofsupplier: number;

  @Column({ name: 'productstock', type: 'int', default: 0 })
  productstock: number;

  @Column({ name: 'productname', type: 'varchar', length: 100, nullable: false })
  productname: string;

  @Column({ name: 'productdescription', type: 'text', nullable: true })
  productdescription: string | null;

  @Column({ name: 'productcode', type: 'varchar', length: 20, nullable: true })
  productcode: string | null;

  @Column({ name: 'purchaseorderid', type: 'int', nullable: true })
  purchaseorderid: number | null;

  @Column({ name: 'suppliercategory', type: 'varchar', length: 100, nullable: false })
  suppliercategory: string;

  @Column({ name: 'image', type: 'text', nullable: false })
  image: string;

  @OneToMany(() => PurchaseProduct, (pp) => pp.product)
  purchaseProducts: PurchaseProduct[];

  @OneToMany(() => OrdersServicesProducts, (op) => op.product)
  ordersProducts: OrdersServicesProducts[];
}
