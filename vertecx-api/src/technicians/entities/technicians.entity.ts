import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('technicians')
export class Technicians {
  @PrimaryGeneratedColumn()
  technicianid: number;

  @Column({ nullable: false })
  userid: number;

  @Column({ nullable: false })
  CV: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userid' })
  users: Users;

  @OneToMany(() => TechnicianTypeMap, (typeMap) => typeMap.technician)
  technicianTypeMaps: TechnicianTypeMap[];
}
