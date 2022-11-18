import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class UpdateTaskUserDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(1)
  is_end: number;
}
