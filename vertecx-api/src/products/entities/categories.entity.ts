import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Products } from 'src/products/entities/products.entity';

@Entity('categories')
export class Categories {
  @PrimaryGeneratedColumn()
  categoryid: number;

  @Column({ nullable: false, length: 50 })
  categoryname: string;

  @Column({ type: 'text', nullable: true })
  categorydescription: string | null;

  @Column({ type: 'boolean', default: true })
  isactive: boolean;

  @Column({ nullable: true })
  icon: string | null;

  @OneToMany(() => Products, (p) => p.category)
  products: Products[];
}
