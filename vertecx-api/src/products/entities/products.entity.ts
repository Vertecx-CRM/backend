import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('products')
export class Products {
  @Column({ nullable: true })
  createddate: string;

  @Column({ nullable: true })
  categoryid: number;

  @Column({ nullable: true })
  isactive: string;

  @Column({ nullable: false })
  productid: number;

  @Column({ nullable: false })
  productprice: number;

  @Column({ nullable: true })
  productstock: number;

  @Column({ nullable: false })
  productname: string;

  @Column({ nullable: true })
  productdescription: string;

  @Column({ nullable: true })
  productcode: string;

  @ManyToOne(() => Productcategories)
  @JoinColumn({ name: 'categoryid' })
  productcategories: Productcategories;

}
