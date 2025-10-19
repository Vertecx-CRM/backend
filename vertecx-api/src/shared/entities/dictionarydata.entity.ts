import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('dictionarydata')
export class Dictionarydata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fecha_actualizacion: string;

  @Column({ nullable: false })
  columna: string;

  @Column({ nullable: true })
  tipo_dato: string;

  @Column({ nullable: true })
  longitud_precision: string;

  @Column({ nullable: true })
  nulo: string;

  @Column({ nullable: true })
  valor_por_defecto: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  restricciones: string;

  @Column({ nullable: true })
  check_constraints: string;

  @Column({ nullable: true })
  check_constraints_tabla: string;

  @Column({ nullable: false })
  tabla: string;

}
