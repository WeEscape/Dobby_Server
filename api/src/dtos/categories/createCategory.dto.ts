import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  group_id: string;

  @IsNotEmpty()
  @IsString()
  category_title: string;
}
