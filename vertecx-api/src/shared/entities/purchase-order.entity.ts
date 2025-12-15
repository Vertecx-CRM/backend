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
  numeroOrden: string;

  // Relaciones

  @ManyToOne(() => Suppliers, { eager: false })
  @JoinColumn({ name: 'proveedor_id' })
  supplier: Suppliers;

  @Column()
  proveedorId: number;

  @ManyToOne(() => States, { eager: false })
  @JoinColumn({ name: 'estado_id' })
  state: States;

  @Column()
  estadoId: number;

  // Fechas

  @Column({ type: 'date' })
  fecha: string;

  // Valores económicos

  @Column('decimal', { precision: 12, scale: 2 })
  precioUnitario: number;

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
