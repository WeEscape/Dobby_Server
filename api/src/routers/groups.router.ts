import { Router } from 'express';
import { CreateGroupDto } from '../dtos/groups/createGroup.dto';
import { JoinGroupDto } from '../dtos/groups/joinGroup.dto';
import { UpdateGroupDto } from '../dtos/groups/updateGroup.dto';
import { responseInterceptor } from '../middlewares/response.interceptor';
import { validateBody } from '../middlewares/validateBody.pipe';
import { GroupsService } from '../services/groups.service';

export const groupsRouter = (groupsService: GroupsService) => {
  const router = Router();

  /** 그룹 생성 */
  router.post('/', validateBody(CreateGroupDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;

      const result = await groupsService.createGroup(user_id, req.body.group_title);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** id별 그룹 조회 */
  router.get('/:group_id', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const group_id = req.params.group_id;

      const result = await groupsService.getGroup(user_id, group_id);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 그룹 수정 */
  router.put('/:group_id', validateBody(UpdateGroupDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const group_id = req.params.group_id;

      const result = await groupsService.updateGroup(user_id, group_id, req.body.group_title);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 그룹 가입 */
  router.post('/:group_id/user', validateBody(JoinGroupDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const group_id = req.params.group_id;

      const result = await groupsService.joinGroup(user_id, group_id, req.body.invite_code);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 그룹 탈퇴 */
  router.delete('/:group_id/user', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const group_id = req.params.group_id;

      await groupsService.leaveGroup(user_id, group_id);

      return res.status(200).json(responseInterceptor(req));
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
