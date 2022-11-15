import { parameter } from './parameter.util';

export const successMessage = {};

export const errorMessage = {
  existUser: '이미 가입된 정보입니다.',
  notFoundUser: '가입된 회원이 없습니다.',
  expiredRefreshToken: 'refresh_token expired',
  invalidParameter: (key: string) => `${parameter[key]}을(를) 확인해주세요.`,
};
