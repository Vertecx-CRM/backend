import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('productcategories')
export class Productcategories {
  @Column({ nullable: false })
  categoryid: number;

  @Column({ nullable: true })
  isactive: string;

  @Column({ nullable: false })
  categoryname: string;

  @Column({ nullable: true })
  categorydescription: string;

}
