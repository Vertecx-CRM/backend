import { Quotes } from 'src/quotes/entities/quotes.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('appointments')
export class Appointments {
  @Column({ nullable: false })
  appointmentdate: string;

  @Column({ nullable: false })
  quotesid: number;

  @Column({ nullable: false })
  technicalid: number;

  @Column({ nullable: false })
  appointmentid: number;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  observation: string;

  @Column({ nullable: true })
  video: string;

  @ManyToOne(() => Quotes)
  @JoinColumn({ name: 'quotesid' })
  quotes: Quotes;

  @ManyToOne(() => Technicians)
  @JoinColumn({ name: 'technicalid' })
  technicians: Technicians;
}
