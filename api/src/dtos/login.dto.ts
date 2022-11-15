import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SocialType } from '../entities/user.entity';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  social_id: string;

  @IsNotEmpty()
  @IsEnum(['kakao', 'google', 'apple'])
  social_type: SocialType;
}
