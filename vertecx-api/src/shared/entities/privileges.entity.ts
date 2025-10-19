import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('privileges')
export class Privileges {
  @Column({ nullable: false })
  privilegeid: number;

  @Column({ nullable: false })
  name: string;

}
