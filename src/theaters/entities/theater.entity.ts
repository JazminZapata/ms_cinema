import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Projector } from '../../projectors/entities/projector.entity';
import { Screening } from '../../screenings/entities/screening.entity';

@Entity('theaters')
export class Theater {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  location!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @OneToOne(() => Projector, (projector) => projector.theater)
  projector?: Projector;

  @OneToMany(() => Screening, (screening) => screening.theater, {
    cascade: false,
  })
  screenings?: Screening[];
}
