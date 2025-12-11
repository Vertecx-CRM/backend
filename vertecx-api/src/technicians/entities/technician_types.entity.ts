import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { States } from 'src/shared/entities/states.entity';

@Entity('techniciantypes')
export class Techniciantypes {
  @PrimaryGeneratedColumn()
  techniciantypeid: number;

  @Column()
  name: string;

  @Column()
  stateid: number;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  state: States;
}