import { IsOptional, IsString } from 'class-validator';
import { ProfileColor } from '../../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  profile_image_ur?: string;

  @IsOptional()
  @IsString()
  profile_color?: ProfileColor;
}
