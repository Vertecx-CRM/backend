import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('suppliers')
export class Suppliers {
  @PrimaryGeneratedColumn()
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
