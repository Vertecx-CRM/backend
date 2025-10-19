import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('suppliers')
export class Suppliers {
  @Column({ nullable: false })
  supplierid: number;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  documenttypeid: number;

  @Column({ nullable: true })
  contactname: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  documentnumber: string;

  @Column({ nullable: true })
  phone: string;

}
