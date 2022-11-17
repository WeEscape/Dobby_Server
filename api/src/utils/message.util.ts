import { parameter } from './parameter.util';

export const successMessage = {};

export const errorMessage = {
  forbidden: 'forbidden',
  duplicate: 'duplicate',
  notFound: 'not found',
  expiredRefreshToken: 'refresh_token expired',
  invalidParameter: (key: string) => `${parameter[key]}`,
};
