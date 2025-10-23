import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('appointments')
export class Appointments {
  @Column({ nullable: false })
  appointmentdate: string;

  @Column({ nullable: false })
  quotesid: number;

  @Column({ nullable: false })
  technicalid: number;

  @PrimaryGeneratedColumn()
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

}
