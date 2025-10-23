import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('technician_certifications')
export class TechnicianCertifications {
  @PrimaryGeneratedColumn()
  technician_certification_id: number;

  @Column({ nullable: false })
  technicianid: number;

  @Column({ nullable: false })
  certificationid: number;

  @Column({ nullable: true })
  uploaded_at: string;

  @Column({ nullable: false })
  stateid: number;

  @Column({ nullable: true })
  file_path: string;

  @ManyToOne(() => Technicians)
  @JoinColumn({ name: 'technicianid' })
  technicians: Technicians;

  @ManyToOne(() => Certifications)
  @JoinColumn({ name: 'certificationid' })
  certifications: Certifications;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

}
