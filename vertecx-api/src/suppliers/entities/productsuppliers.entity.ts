import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('productsuppliers')
export class Productsuppliers {
  @PrimaryGeneratedColumn()
  productsupplierid: number;

  @Column({ nullable: false })
  supplierid: number;

  @Column({ nullable: false })
  categoryid: number;

  @ManyToOne(() => Productcategories)
  @JoinColumn({ name: 'categoryid' })
  productcategories: Productcategories;

}
