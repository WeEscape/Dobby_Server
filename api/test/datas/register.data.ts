import { RegisterDto } from '../../src/dtos/register.dto';

export const registerData: { [key: string]: RegisterDto } = {
  kakao: {
    social_id: 'kakao1',
    social_type: 'kakao',
    user_name: 'kakao1',
    profile_color: 'Blue',
  },
  apple: {
    social_id: 'apple1',
    social_type: 'apple',
    user_name: 'apple1',
    profile_color: 'Blue',
    authorize_code: 'apple_authorize_code1',
  },
  duplicateSocialIdAndSocialType: {
    social_id: 'kakao1',
    social_type: 'kakao',
    user_name: 'kakao2',
    profile_color: 'Green',
  },
};
