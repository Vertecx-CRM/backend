import { Ordersservices } from 'src/services/entities/ordersservices.entity';
import { States } from 'src/shared/entities/states.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('quotes')
export class Quotes {
  @Column({ nullable: false })
  quotesid: number;

  @Column({ nullable: false })
  ordersservicesid: number;

  @Column({ nullable: false })
  statesid: number;

  @Column({ nullable: true })
  quotedata: string;

  @Column({ nullable: true })
  observation: string;

  @ManyToOne(() => Ordersservices)
  @JoinColumn({ name: 'ordersservicesid' })
  ordersservices: Ordersservices;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'quotesid' })
  states: States;
}
