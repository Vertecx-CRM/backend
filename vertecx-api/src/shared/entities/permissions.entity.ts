import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('permissions')
export class Permissions {
  @Column({ nullable: false })
  permissionid: number;

  @Column({ nullable: false })
  module: string;

}
