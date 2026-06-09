import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { States } from './states.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  // Identificación

  @Column({ unique: true })
  numeroorden: string;

  // Relaciones

  @ManyToOne(() => Suppliers, { eager: false })
  @JoinColumn({ name: 'proveedorid' })
  supplier: Suppliers;

  @Column()
  proveedorid: number;

  @ManyToOne(() => States, { eager: false })
  @JoinColumn({ name: 'estadoid' })
  state: States;

  @Column()
  estadoid: number;

  // Fechas

  @Column({ type: 'date' })
  fecha: string;

  // Valores económicos

  @Column('decimal', { precision: 12, scale: 2 })
  preciounitario: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 14, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 14, scale: 2 })
  iva: number;

  @Column('decimal', { precision: 14, scale: 2 })
  total: number;

  // Observaciones

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  // Auditoría

  @CreateDateColumn()
  createat: Date;

  @UpdateDateColumn()
  updateat: Date;
}
