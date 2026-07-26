import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn({ name: 'reviewid' })
  reviewid: number;

  @Column({ name: 'name', type: 'varchar', length: 90 })
  name: string;

  @Column({ name: 'role', type: 'varchar', length: 120, nullable: true })
  role?: string;

  @Column({ name: 'company', type: 'varchar', length: 120, nullable: true })
  company?: string;

  @Column({ name: 'city', type: 'varchar', length: 90, nullable: true })
  city?: string;

  @Column({ name: 'email', type: 'varchar', length: 160, nullable: true })
  email?: string;

  @Column({ name: 'rating', type: 'int' })
  rating: number;

  @Column({ name: 'comment', type: 'varchar', length: 700 })
  comment: string;

  @Column({ name: 'approved', type: 'boolean', default: true })
  approved: boolean;

  @Column({ name: 'source', type: 'varchar', length: 40, default: 'website' })
  source: string;

  @CreateDateColumn({ name: 'createdat', type: 'timestamp' })
  createdat: Date;
}
