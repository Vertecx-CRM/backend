import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from 'src/users/entities/users.entity';

@Entity('suppliers')
export class Suppliers {
  @PrimaryGeneratedColumn()
  supplierid: number;

  @Column({ nullable: false, length: 120 })
  servicetype: string;

  @Column({ nullable: false, length: 120 })
  contactname: string;

  @Column({ nullable: false, unique: true, length: 50 })
  nit: string;

  @Column({ nullable: false, length: 200 })
  address: string;

  @Column({ type: 'smallint', default: 0 })
  rating: number;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userid' })
  user: Users;
}
