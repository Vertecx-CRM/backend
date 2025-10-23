import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('productsuppliers')
export class Productsuppliers {
  @Column({ nullable: false })
  productsupplierid: number;

  @Column({ nullable: false })
  supplierid: number;

  @Column({ nullable: false })
  categoryid: number;

  @ManyToOne(() => Productcategories)
  @JoinColumn({ name: 'categoryid' })
  productcategories: Productcategories;

}
