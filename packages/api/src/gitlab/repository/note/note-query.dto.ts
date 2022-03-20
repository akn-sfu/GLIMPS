import { Note } from '@ceres/types';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsString,
} from 'class-validator';
import { QueryDto } from '../../../common/query-dto';

export class NoteQueryDto extends QueryDto {
  @IsOptional()
  @IsUUID()
  merge_request?: string;

  @IsOptional()
  @IsUUID()
  issue?: string;

  @IsOptional()
  author_id?: string[];

  @IsOptional()
  @IsDateString()
  created_start_date?: string;

  @IsOptional()
  @IsDateString()
  created_end_date?: string;

  @IsOptional()
  @IsUUID()
  repository_id?: string;

  @IsOptional()
  @IsEnum(Note.Type)
  type?: Note.Type;

  @IsOptional()
  @IsString()
  timezone?: string;
}
