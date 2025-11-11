import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class ProductCategory {
  @PrimaryGeneratedColumn({ name: 'categoryid' })
  id: number;

  @Column({ name: 'categoryname', length: 50 })
  name: string;

  @Column({ name: 'categorydescription', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'isactive', default: true })
  status: boolean;

  @Column({ nullable: true })
  icon?: string;
}
