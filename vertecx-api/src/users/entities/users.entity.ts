import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('users')
export class Users {
  @Column({ nullable: true })
  createat: Date;

  @Column({ nullable: false })
  stateid: number;

  @Column({ nullable: true })
  updateat: Date;

  @Column({ nullable: false })
  typeid: number;

  @PrimaryGeneratedColumn()
  userid: number;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  documentnumber: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastname: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @ManyToOne(() => States)
  @JoinColumn({ name: 'stateid' })
  states: States;

  @ManyToOne(() => Typeofdocuments)
  @JoinColumn({ name: 'typeid' })
  typeofdocuments: Typeofdocuments;

}
