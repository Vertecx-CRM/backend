import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productcategories')
export class Productcategories {
  @PrimaryGeneratedColumn()
  categoryid: number;

  @Column({ nullable: true })
  isactive: string;

  @Column({ nullable: false })
  categoryname: string;

  @Column({ nullable: true })
  categorydescription: string;
}
