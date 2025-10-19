import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('certifications')
export class Certifications {
  @Column({ nullable: false })
  certificationid: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: false })
  name: string;

}
