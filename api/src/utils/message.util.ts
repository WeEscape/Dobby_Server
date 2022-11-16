import { parameter } from './parameter.util';

export const successMessage = {};

export const errorMessage = {
  forbidden: '권한이 없습니다.',
  existUser: '이미 가입된 정보입니다.',
  existTitle: '이미 사용 중입니다.',
  existGroupUser: '이미 그룹 회원입니다.',
  notFoundUser: '가입된 회원이 없습니다.',
  notFoundGroup: '해당 id의 그룹이 없습니다.',
  expiredRefreshToken: 'refresh_token expired',
  invalidParameter: (key: string) => `${parameter[key]}을(를) 확인해주세요.`,
};
