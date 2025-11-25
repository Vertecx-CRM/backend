import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Products } from 'src/products/entities/products.entity';
import { Purchasesmanagement } from 'src/purchases/entities/purchasesmanagement.entity';

@Entity('purchase_products')
export class PurchaseProduct {
  @PrimaryGeneratedColumn({ name: 'purchase_product_id' })
  purchaseProductId: number;

  @Column({ name: 'purchaseorderid', nullable: false })
  purchaseorderid: number;

  @Column({ name: 'productid', nullable: false })
  productid: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitprice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    insert: false,
    update: false,
  })
  subtotal: number;

  @ManyToOne(
    () => Purchasesmanagement,
    (purchase) => purchase.purchaseProducts,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'purchaseorderid' })
  purchase: Purchasesmanagement;

  @ManyToOne(() => Products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productid' })
  product: Products;
}
