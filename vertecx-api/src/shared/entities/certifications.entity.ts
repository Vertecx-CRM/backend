import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('certifications')
export class Certifications {
  @PrimaryGeneratedColumn()
  certificationid: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: false })
  name: string;
}
