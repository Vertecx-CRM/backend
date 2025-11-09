import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { States } from 'src/shared/entities/states.entity';

@Entity('suppliers')
export class Suppliers {
  @PrimaryGeneratedColumn()
  supplierid: number;

  @Column({ length: 150, nullable: false })
  name: string;

  @Column({ length: 50, nullable: false, unique: true })
  nit: string;

  @Column({ length: 20, nullable: false })
  phone: string;

  @Column({ length: 160, nullable: false })
  email: string;

  @Column({ length: 200, nullable: false })
  address: string;

  @Column({ nullable: false })
  state: number;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'state' })
  stateRelation: States;

  @Column({ length: 120, nullable: false })
  contactname: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ type: 'smallint', default: 0 })
  rating: number;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createat: Date;

  @Column({ type: 'timestamp with time zone', nullable: false })
  updateat: Date;
}
