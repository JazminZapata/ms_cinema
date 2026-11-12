import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class TheaterDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  capacity?: number;
}
