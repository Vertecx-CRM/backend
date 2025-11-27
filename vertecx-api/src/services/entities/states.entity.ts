import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('states')
export class States {
  @PrimaryGeneratedColumn({ name: 'stateid' })
  stateid: number;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string | null;
}
