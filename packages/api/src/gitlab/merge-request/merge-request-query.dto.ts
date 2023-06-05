import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryDto } from '../../common/query-dto';

export class MergeRequestQueryDto extends QueryDto {
  @IsUUID()
  repository: string;

  @IsOptional()
  @IsString({ each: true })
  author_email?: string[];

  @IsOptional()
  @IsDateString()
  merged_start_date?: string;

  @IsOptional()
  @IsDateString()
  merged_end_date?: string;

  @IsOptional()
  @IsDateString()
  commit_start_date?: string;

  @IsOptional()
  @IsDateString()
  commit_end_date?: string;

  @IsOptional()
  @IsUUID()
  note_id?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
