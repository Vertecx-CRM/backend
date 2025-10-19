import { States } from 'src/shared/entities/states.entity';
import { Suppliers } from 'src/shared/entities/suppliers.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('purchasesmanagement')
export class Purchasesmanagement {
  @PrimaryGeneratedColumn()
  purchaseorderid: number;

  @Column({ nullable: true })
  numberoforder: number;

  @Column({ nullable: true })
  reference: number;

  @Column({ nullable: true })
  stateid: number;

  @Column({ nullable: true })
  supplierid: number;

  @Column({ nullable: false })
  createddate: Date;

  @Column({ nullable: false })
  updateddate: Date;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

  @ManyToOne(() => Suppliers)
  @JoinColumn({ name: 'supplierid' })
  suppliers: Suppliers;
}
