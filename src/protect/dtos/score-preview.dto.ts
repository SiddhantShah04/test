import { IsArray, IsBoolean, IsOptional, IsUUID, ArrayNotEmpty } from 'class-validator';

export class ScorePreviewDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  threatIds!: string[];

  @IsOptional()
  @IsBoolean()
  ignoreOtherThreats?: boolean = true;
}
