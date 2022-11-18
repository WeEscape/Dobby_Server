import { ArrayMinSize, IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { RepeatCycle } from '../../entities/task.entity';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  task_title: string;

  @IsOptional()
  @IsIn(['1D', '1W', '1M'])
  repeat_cycle?: RepeatCycle;

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
  end_repeat_at?: string;

  @IsNotEmpty()
  @IsDateString()
  excute_at: string;

  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  add_user_ids?: string[];
}
