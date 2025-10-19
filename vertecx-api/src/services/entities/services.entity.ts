import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('services')
export class Services {
  @Column({ nullable: false })
  serviceid: number;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  category: string;

  @Column({ nullable: true })
  image: string;

}
