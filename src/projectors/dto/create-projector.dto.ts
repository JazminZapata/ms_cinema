import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProjectorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  brand!: string;

  @IsInt()
  @Min(1)
  high!: number;

  @IsInt()
  @Min(1)
  width!: number;

  //Lo agino cuando quiera
  @IsOptional()
  @IsInt()
  @Min(1)
  theaterId?: number;
}
