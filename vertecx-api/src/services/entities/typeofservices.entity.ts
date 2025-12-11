import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'typeofservices', schema: 'public' })
export class Typeofservices {
  @PrimaryGeneratedColumn({ name: 'typeofserviceid', type: 'integer' })
  typeofserviceid: number;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'statusid', type: 'integer', nullable: false, default: 1 })
  statusid: number;
}
