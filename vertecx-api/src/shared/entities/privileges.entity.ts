import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('privileges')
export class Privileges {
  @PrimaryGeneratedColumn()
  privilegeid: number;

  @Column({ nullable: false })
  name: string;

}
