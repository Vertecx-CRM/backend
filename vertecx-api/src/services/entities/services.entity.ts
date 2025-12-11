import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Typeofservices } from './typeofservices.entity';
import { States } from './states.entity';

@Entity('services')
export class Services {
  @PrimaryGeneratedColumn({ name: 'serviceid' })
  serviceid: number;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'description', type: 'varchar', nullable: false })
  description: string;

  @Column({ name: 'image', type: 'varchar', nullable: false })
  image: string;

  @Column({ name: 'typeofserviceid', type: 'int', nullable: false })
  typeofserviceid: number;

  @ManyToOne(() => Typeofservices, { nullable: false })
  @JoinColumn({ name: 'typeofserviceid' })
  typeofservice: Typeofservices;

  @Column({ name: 'stateid', type: 'int', nullable: false, default: 1 })
  stateid: number;

  @ManyToOne(() => States, { nullable: false })
  @JoinColumn({ name: 'stateid' })
  state: States;
}
