import { CreateScreeningDto } from '../dto/create-screening.dto';
import { ScreeningResponseDto } from '../dto/screening-response.dto';
import { UpdateScreeningDto } from '../dto/update-screening.dto';
import { Screening } from '../entities/screening.entity';

export class ScreeningMapper {
  static toEntity(
    dto: CreateScreeningDto,
    theater: Screening['theater'],
    movie: Screening['movie'],
  ): Screening {
    return Object.assign(new Screening(), {
      scheduledAt: new Date(dto.scheduledAt),
      theater,
      movie,
    });
  }

  static mergeEntity(entity: Screening, dto: UpdateScreeningDto): Screening {
    if (dto.scheduledAt !== undefined) {
      entity.scheduledAt = new Date(dto.scheduledAt);
    }
    return entity;
  }

  static toResponseDto(entity: Screening): ScreeningResponseDto {
    return {
      id: entity.id,
      scheduledAt: entity.scheduledAt,
      theaterId: entity.theater.id,
      movieId: entity.movie.id,
    };
  }

  static toResponseDtoList(entities: Screening[]): ScreeningResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }
}
