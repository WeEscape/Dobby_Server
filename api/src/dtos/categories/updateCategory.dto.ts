import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsNotEmpty()
  @IsString()
  category_title: string;
}
