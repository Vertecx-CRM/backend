// shared/entities/typeofdocuments.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('typeofdocuments')
export class Typeofdocuments {
  @PrimaryGeneratedColumn()
  typeofdocumentid: number; // ← Esta es la columna real en la BD

  @Column({ nullable: true })
  createat: Date;

  @Column({ nullable: true })
  updateat: Date;

  @Column({ nullable: false })
  name: string;
}
