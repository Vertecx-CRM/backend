import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Roleconfiguration } from './roleconfiguration.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  roleid: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @OneToMany(() => Roleconfiguration, (roleConfig) => roleConfig.roles)
  roleconfigurations: Roleconfiguration[];
}
