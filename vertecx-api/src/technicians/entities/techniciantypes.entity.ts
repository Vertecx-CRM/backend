import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { States } from 'src/shared/entities/states.entity';

@Entity('techniciantypes')
@Index('ux_tt_name', ['name'], { unique: true })
export class TechnicianTypes {
  @PrimaryGeneratedColumn({ name: 'techniciantypeid', type: 'int' })
  techniciantypeid: number;

  @Column({ name: 'name', type: 'varchar', length: 120 })
  name: string;

  // Mapeo exacto a columnas existentes en BD
  @CreateDateColumn({
    name: 'createat',
    type: 'timestamp without time zone',
    default: () => 'now()',
  })
  createat: Date;

  @UpdateDateColumn({
    name: 'updateat',
    type: 'timestamp without time zone',
    default: () => 'now()',
  })
  updateat: Date;

  @Column({ name: 'stateid', type: 'int', nullable: true })
  stateid?: number;

  @ManyToOne(() => States, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'stateid', referencedColumnName: 'stateid' })
  state?: States;
}
