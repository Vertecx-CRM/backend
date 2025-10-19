import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('purchasesmanagement')
export class Purchasesmanagement {
  @Column({ nullable: false })
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
