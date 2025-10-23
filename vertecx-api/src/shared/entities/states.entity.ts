import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('states')
export class States {
  @PrimaryGeneratedColumn()
  stateid: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

}
