import { ArrayMinSize, IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  task_title?: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  notice_available?: number;

  @IsOptional()
  @IsDateString()
  excute_at?: string;

  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  add_user_ids?: string[];

  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  delete_user_ids?: string[];
}
