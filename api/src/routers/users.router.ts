import { Router } from 'express';
import { UpdateUserDto } from '../dtos/users/updateUser.dto';
import { ForbiddenError } from '../exceptions/Forbidden.exception';
import { responseInterceptor } from '../middlewares/response.interceptor';
import { validateBody } from '../middlewares/validateBody.pipe';
import { UsersService } from '../services/users.service';
import { errorMessage } from '../utils/message.util';

export const usersRouter = (usersService: UsersService) => {
  const router = Router();

  /** 회원 본인 조회 */
  router.get('/my', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;

      const result = await usersService.getUserInfo(user_id);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** id별 회원 조회 */
  router.get('/:user_id', async (req, res, next) => {
    try {
      const user_id = req.params.user_id;

      const result = await usersService.getUserInfo(user_id);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 회원 수정 */
  router.put('/:user_id', validateBody(UpdateUserDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      if (user_id !== req.params.user_id) {
        throw new ForbiddenError(errorMessage.forbidden);
      }

      const result = await usersService.updateUser(user_id, req.body);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
