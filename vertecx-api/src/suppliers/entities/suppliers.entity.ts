import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { States } from 'src/shared/entities/states.entity';

@Entity('suppliers')
export class Suppliers {
  @PrimaryGeneratedColumn()
  supplierid: number;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  nit: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ type: 'varchar', length: 200 })
  address: string;

  @Column({ type: 'varchar', length: 120 })
  servicetype: string;

  @Column({ type: 'int' })
  stateid: number;

  @Column({ type: 'varchar', length: 120 })
  contactname: string;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  state: States;

  @CreateDateColumn()
  createat: Date;

  @UpdateDateColumn()
  updateat: Date;
}
