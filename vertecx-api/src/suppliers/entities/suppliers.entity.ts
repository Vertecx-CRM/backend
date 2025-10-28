import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { States } from 'src/shared/entities/states.entity';

@Entity('suppliersdanier')
@Index(['name'], { unique: true })
@Index(['nit'], { unique: true })
@Index(['phone'], { unique: true })
@Index(['email'], { unique: true })
export class Suppliers {
  @PrimaryGeneratedColumn()
  supplierid: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  nit: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone: string;

  @Column({ type: 'varchar', length: 160, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  address: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  servicetype: string;

  @Column({ type: 'int', nullable: false })
  stateid: number;

  @Column({ type: 'varchar', length: 120, nullable: false })
  contactname: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  image: string;

  @Column({ type: 'smallint', default: 0 })
  rating: number;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  state: States;

  @CreateDateColumn()
  createat: Date;

  @UpdateDateColumn()
  updateat: Date;
}
