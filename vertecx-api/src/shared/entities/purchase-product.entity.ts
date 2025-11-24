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
  purchase_productid: number;

  @Column({ nullable: false })
  purchaseorderid: number;

  @Column({ nullable: false })
  productid: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitprice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  subtotal: number;

  // 🔗 Relación con la orden de compra
  @ManyToOne(
    () => Purchasesmanagement,
    (purchase) => purchase.purchaseProducts,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'purchaseorderid' })
  purchase: Purchasesmanagement;

  // 🔗 Relación con el producto
  @ManyToOne(() => Products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productid' })
  product: Products;
}
