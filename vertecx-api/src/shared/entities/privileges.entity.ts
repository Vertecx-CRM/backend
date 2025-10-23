import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('privileges')
export class Privileges {
  @PrimaryGeneratedColumn()
  privilegeid: number;

  @Column({ nullable: false })
  name: string;
}
