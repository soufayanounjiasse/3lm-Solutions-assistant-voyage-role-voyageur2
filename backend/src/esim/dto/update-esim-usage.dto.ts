import { IsInt, Min } from 'class-validator';

export class UpdateEsimUsageDto {
  @IsInt()
  @Min(0)
  dataUsedMb: number;
}
