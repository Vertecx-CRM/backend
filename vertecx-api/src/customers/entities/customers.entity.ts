import { Sales } from 'src/sales/entities/sales.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('customers')
export class Customers {
  @PrimaryGeneratedColumn()
  customerid: number;

  @Column({ nullable: false })
  userid: number;

  @Column({ nullable: true })
  customercity: string;

  @Column({ nullable: true })
  customerzipcode: string;

  // 🔹 Relación con usuario (obligatoria)
  @ManyToOne(() => Users, (user) => user.customers, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE', // Si se elimina el usuario, se elimina el customer
  })
  @JoinColumn({ name: 'userid' })
  users: Users;

  // 🔹 Relación con ventas
  @OneToMany(() => Sales, (sale) => sale.customer)
  sales: Sales[];
}