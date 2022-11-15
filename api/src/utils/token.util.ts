import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../entities/user.entity';

/** access token 생성 */
export const generateAccessToken = (user: User): string =>
  jwt.sign(
    {
      user_id: user.user_id,
    },
    <string>config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

/** refresh token 생성 */
export const generateRefreshToken = (): string => {
  return jwt.sign({}, <string>config.jwt.secret);
};

export const verifyAccessToken = (access_token: string): jwt.JwtPayload =>
  <jwt.JwtPayload>jwt.verify(access_token, <string>config.jwt.secret);
