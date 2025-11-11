import { Techniciantypes } from 'src/technicians/entities/technician_types.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';


@Entity('technician_type_map')
export class TechnicianTypeMap {
  @PrimaryGeneratedColumn()
  technician_type_map_id: number;

  @Column({ nullable: false })
  technicianid: number;

  @Column({ nullable: false })
  techniciantypeid: number;

  @ManyToOne(() => Technicians, (tech) => tech.technicianid)
  @JoinColumn({ name: 'technicianid' })
  technician: Technicians;

  @ManyToOne(() => Techniciantypes)
  @JoinColumn({ name: 'techniciantypeid' })
  techniciantype: Techniciantypes;
}