import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { Technicians } from './technicians.entity';
import { TechnicianTypes } from './techniciantypes.entity';

@Entity('technician_type_map')
@Unique('ux_ttm_pair', ['technicianid', 'techniciantypeid'])
export class TechnicianTypeMap {
  // PK real en BD: technician_type_mapid
  @PrimaryGeneratedColumn({ name: 'technician_type_mapid', type: 'int' })
  technician_type_mapid: number;

  @Column({ name: 'technicianid', type: 'int' })
  technicianid: number;

  @Column({ name: 'techniciantypeid', type: 'int' })
  techniciantypeid: number;

  @ManyToOne(() => Technicians, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'technicianid', referencedColumnName: 'technicianid' })
  technician: Technicians;

  @ManyToOne(() => TechnicianTypes, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({
    name: 'techniciantypeid',
    referencedColumnName: 'techniciantypeid',
  })
  type: TechnicianTypes;

  @CreateDateColumn({
    name: 'createdat',
    type: 'timestamp without time zone',
    default: () => 'now()',
  })
  createdat: Date;
}
