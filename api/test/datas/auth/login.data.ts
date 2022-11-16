import { LoginDto } from '../../../src/dtos/auth/login.dto';

export const loginData: { [key: string]: LoginDto } = {
  kakao: { social_id: 'kakao1', social_type: 'kakao' },
  apple: { social_id: 'apple1', social_type: 'apple' },
  invalidSocialIdOrSocialType: {
    social_id: 'kakao1',
    social_type: 'apple',
  },
};
