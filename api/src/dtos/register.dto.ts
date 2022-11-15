import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ProfileColor, SocialType } from '../entities/user.entity';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  social_id: string;

  @IsNotEmpty()
  @IsEnum(['kakao', 'google', 'apple'])
  social_type: SocialType;

  @IsNotEmpty()
  @IsString()
  user_name: string;

  @IsOptional()
  @IsString()
  profile_image_url?: string;

  @IsNotEmpty()
  @IsEnum(['Blue', 'Cyan', 'Green', 'Pink', 'Purple', 'Red', 'Orange', 'Yellow', 'Brown', 'Black'])
  profile_color: ProfileColor;

  @IsOptional()
  @IsString()
  @ValidateIf(object => object.social_type === 'apple')
  @IsNotEmpty()
  authorize_code?: string;
}
