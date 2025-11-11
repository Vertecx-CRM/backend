import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { TechnicianTypeMap } from './technician-type-map.entity';

@Entity('technicians')
@Index('ux_technicians_userid', ['userid'], { unique: true })
export class Technicians {
  @PrimaryGeneratedColumn({ name: 'technicianid' })
  technicianid: number;

  @Column({ name: 'userid', type: 'int', nullable: false })
  userid: number;

  @Column({ name: 'cv', type: 'varchar', length: 250, nullable: true })
  cv?: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userid', referencedColumnName: 'userid' })
  user: Users;

  @OneToMany(() => TechnicianTypeMap, (map) => map.technician, { eager: true })
  typesMap: TechnicianTypeMap[];
}
