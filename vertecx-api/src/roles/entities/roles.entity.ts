import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Roleconfiguration } from './roleconfiguration.entity';
import { Users } from 'src/users/entities/users.entity';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  roleid: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Roleconfiguration, (roleConfig) => roleConfig.roles)
  roleconfigurations: Roleconfiguration[];

    @OneToMany(() => Users, (roleid) => roleid.roles)
  users: Roles[];
}
