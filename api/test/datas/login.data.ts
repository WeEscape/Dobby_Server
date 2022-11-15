import { LoginDto } from '../../src/dtos/login.dto';

export const loginData: { [key: string]: LoginDto } = {
  success: { social_id: 'kakao1', social_type: 'kakao' },
  invalidSocialIdOrSocialType: {
    social_id: 'kakao1',
    social_type: 'apple',
  },
};
