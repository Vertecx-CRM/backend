import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('states')
export class States {
  @PrimaryGeneratedColumn()
  stateid: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}
