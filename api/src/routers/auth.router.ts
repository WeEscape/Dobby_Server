import { Router } from 'express';
import { GetTokens } from '../dtos/getTokens.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { authGuard } from '../middlewares/auth.guard';
import { responseInterceptor } from '../middlewares/response.interceptor';
import { validateBody } from '../middlewares/validateBody.pipe';
import { AuthService } from '../services/auth.service';

export const authRouter = (authService: AuthService) => {
  const router = Router();

  /** 회원가입 */
  router.post('/register', validateBody(RegisterDto), async (req, res, next) => {
    try {
      const result = await authService.register(req.body);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 로그인 */
  router.post('/login', validateBody(LoginDto), async (req, res, next) => {
    try {
      const ip = req.ip;

      const result = await authService.login(req.body, ip);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 로그아웃 */
  router.post('/logout', authGuard, async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;

      await authService.logout(user_id);

      return res.status(200).json(responseInterceptor(req));
    } catch (err) {
      return next(err);
    }
  });

  /** 회원탈퇴 */
  router.post('/withdraw', authGuard, async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;

      await authService.withdraw(user_id);

      return res.status(200).json(responseInterceptor(req));
    } catch (err) {
      return next(err);
    }
  });

  /** tokens 재발급 */
  router.post('/tokens', validateBody(GetTokens), async (req, res, next) => {
    try {
      const ip = req.ip;

      const result = await authService.getTokens(req.body.refresh_token, ip);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
