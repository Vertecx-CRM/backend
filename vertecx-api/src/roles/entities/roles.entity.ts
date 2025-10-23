import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  roleid: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: false })
  name: string;

}
