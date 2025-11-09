import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  roleid: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: false, unique: true })
  name: string;
}
