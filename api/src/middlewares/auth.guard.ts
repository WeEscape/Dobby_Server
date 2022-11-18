import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../exceptions/Unauthorized.exception';
import { verifyAccessToken } from '../utils/token.util';

/** access token 인가 */
export const authGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // socket 서버용
    if (req.headers.key === 'schedule') {
      return next();
    }

    const access_token = req.headers.authorization?.split(' ')[1];
    if (!access_token) {
      return next(new UnauthorizedError('access_token empty'));
    }

    const jwtPayload = verifyAccessToken(access_token);
    req.user = jwtPayload;

    return next();
  } catch (err: any) {
    if (err.message === 'jwt expired') {
      return next(new UnauthorizedError('acceess_token expired'));
    } else {
      return next(new UnauthorizedError('acceess_token invalid'));
    }
  }
};
