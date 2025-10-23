import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('permissions')
export class Permissions {
  @PrimaryGeneratedColumn()
  permissionid: number;

  @Column({ nullable: false })
  module: string;

}
