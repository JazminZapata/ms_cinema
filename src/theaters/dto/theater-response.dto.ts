import { ProjectorResponseDto } from '../../projectors/dto/projector-response.dto';
import { ScreeningResponseDto } from '../../screenings/dto/screening-response.dto';

export class TheaterResponseDto {
  id!: number;
  location!: string;
  capacity!: number;
  projector?: ProjectorResponseDto; //Opcional
  screenings?: ScreeningResponseDto[];
  //sillas opcionales por lo que es de respeusta.
}
