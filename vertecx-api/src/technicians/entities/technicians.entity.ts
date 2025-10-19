import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('technicians')
export class Technicians {
  @Column({ nullable: false })
  technicianid: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: false })
  roleconfigurationid: number;

  @Column({ nullable: false })
  certificationid: number;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  documentnumber: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  phone: string;

  @ManyToOne(() => Roleconfiguration)
  @JoinColumn({ name: 'roleconfigurationid' })
  roleconfiguration: Roleconfiguration;

  @ManyToOne(() => Certifications)
  @JoinColumn({ name: 'certificationid' })
  certifications: Certifications;

}
