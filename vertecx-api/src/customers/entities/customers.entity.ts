import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('customers')
export class Customers {
  @Column({ nullable: false })
  customerid: number;

  @Column({ nullable: true })
  stateid: number;

  @Column({ nullable: true })
  customerstatus: string;

  @Column({ nullable: true })
  createddate: string;

  @Column({ nullable: true })
  customeraddress: string;

  @Column({ nullable: true })
  customercity: string;

  @Column({ nullable: true })
  customerzipcode: string;

  @Column({ nullable: false })
  customername: string;

  @Column({ nullable: true })
  customeremail: string;

  @Column({ nullable: true })
  customerphone: string;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

}
