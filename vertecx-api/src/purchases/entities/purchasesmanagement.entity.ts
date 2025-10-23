import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

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
  createdat: string;

  @Column({ nullable: false })
  updatedat: string;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

}
