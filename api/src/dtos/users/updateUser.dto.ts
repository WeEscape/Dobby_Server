import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  profile_image_ur?: string;

  @IsOptional()
  @IsString()
  profile_color?: string;
}
