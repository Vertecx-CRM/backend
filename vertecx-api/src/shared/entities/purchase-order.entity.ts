import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { States } from 'src/shared/entities/states.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'state_id' })
  stateId: number;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @ManyToOne(() => States, { eager: false })
  @JoinColumn({ name: 'state_id', referencedColumnName: 'stateid' })
  state: States;

  @ManyToOne(() => Suppliers, { eager: false })
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'supplierid' })
  supplier: Suppliers;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}