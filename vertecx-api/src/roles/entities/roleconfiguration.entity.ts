import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('roleconfiguration')
export class Roleconfiguration {
  @PrimaryGeneratedColumn()
  roleconfigurationid: number;

  @Column({ nullable: false })
  roleid: number;

  @Column({ nullable: false })
  permissionid: number;

  @Column({ nullable: false })
  privilegeid: number;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'roleid' })
  roles: Roles;

  @ManyToOne(() => Permissions)
  @JoinColumn({ name: 'permissionid' })
  permissions: Permissions;

  @ManyToOne(() => Privileges)
  @JoinColumn({ name: 'privilegeid' })
  privileges: Privileges;

}
