import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('typeofdocuments')
export class Typeofdocuments {
  @PrimaryGeneratedColumn()
  typeofdocumentid: number;

  @Column({ nullable: true })
  createat: Date;

  @Column({ nullable: true })
  updateat: Date;

  @Column({ nullable: false })
  name: string;
}
