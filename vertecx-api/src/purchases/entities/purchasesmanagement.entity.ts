import { Products } from 'src/products/entities/products.entity';
import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';
import { States } from 'src/shared/entities/states.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';

@Entity('purchasesmanagement')
export class Purchasesmanagement {
  @PrimaryGeneratedColumn()
  purchaseorderid: number;

  @Column({ nullable: false, unique: true, length: 50 })
  numberoforder: string;

  @Column({ nullable: false, length: 50 })
  reference: string;

  @Column({ nullable: true })
  supplierid: number;

  @ManyToOne(() => Suppliers)
  @JoinColumn({ name: 'supplierid' })
  supplier: Suppliers;

  @Column({ nullable: true })
  stateid: number;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  state: States;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdat: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  updatedat: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @OneToMany(
    () => PurchaseProduct,
    (purchaseProduct) => purchaseProduct.purchase,
  )
  purchaseProducts: PurchaseProduct[];
}
