import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToMany,
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

  @Column({ nullable: false })
  CV: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userid', referencedColumnName: 'userid' })
  user: Users;

  @OneToMany(() => TechnicianTypeMap, (typeMap) => typeMap.technician)
  technicianTypeMaps: TechnicianTypeMap[];
}
