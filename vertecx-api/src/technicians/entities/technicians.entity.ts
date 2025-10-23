import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('technicians')
export class Technicians {
  @PrimaryGeneratedColumn()
  technicianid: number;

  @Column({ nullable: false })
  userid: number;

  @Column({ nullable: false })
  roleconfigurationid: number;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userid' })
  users: Users;

  @ManyToOne(() => Roleconfiguration)
  @JoinColumn({ name: 'roleconfigurationid' })
  roleconfiguration: Roleconfiguration;

}
