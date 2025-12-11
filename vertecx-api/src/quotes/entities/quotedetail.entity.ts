import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quotes } from './quotes.entity';

@Entity('quotedetails')
export class QuoteDetail {
  @PrimaryGeneratedColumn()
  quotedetailid: number;

  @Column()
  quotesid: number;

  @ManyToOne(() => Quotes, (q) => q.details)
  @JoinColumn({ name: 'quotesid' })
  quote: Quotes;

  // Si el producto existe (del catálogo)
  @Column({ nullable: true })
  productid: number | null;

  // Nombre del producto o descripción libre si no existe
  @Column({ type: 'varchar', length: 150 })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unitprice: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: number;

  // DISPO / NO_DISPO
  @Column({ type: 'varchar', default: 'DISPONIBLE' })
  availability: 'DISPONIBLE' | 'NO_DISPONIBLE';
}
