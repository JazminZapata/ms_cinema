import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Theater } from '../../theaters/entities/theater.entity';

@Entity('projectors')
export class Projector {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  brand!: string;

  @Column({ type: 'int' })
  high!: number;

  @Column({ type: 'int' })
  width!: number;

  @OneToOne(() => Theater, (theater) => theater.projector, {
    //Como el fecth -> LAZY o ...
    cascade: false,
    //No eliminacion en cascadan 
    onDelete: 'NO ACTION',
  })
  //Clave foranea
  @JoinColumn({ name: 'theater_id' })
  //Como se va a llamar en mi entiedad
  theater?: Theater;
}
