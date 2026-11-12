import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTheaterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  location!: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  capacity!: number;
}
