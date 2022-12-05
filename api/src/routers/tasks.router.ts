import { Router } from 'express';
import { CreateTaskDto } from '../dtos/tasks/createTask.dto';
import { UpdateTaskDto } from '../dtos/tasks/updateTask.dto';
import { UpdateTaskUserDto } from '../dtos/tasks/updateTaskUser.dto';
import { responseInterceptor } from '../middlewares/response.interceptor';
import { validateBody } from '../middlewares/validateBody.pipe';
import { Periodical } from '../repositories/tasks.repository';
import { TasksService } from '../services/tasks.service';

export const tasksRouter = (tasksService: TasksService) => {
  const router = Router();

  /** 집안일 생성 */
  router.post('/', validateBody(CreateTaskDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;

      const result = await tasksService.createTask(user_id, req.body);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 그룹별 집안일 목록 조회 */
  router.get('/group/:group_id/:date/:periodical', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const { group_id, date, periodical } = req.params;

      const result = await tasksService.getTasksByGroupId(user_id, group_id, date, <Periodical>periodical);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 회원별 집안일 목록 조회 */
  router.get('/user/:group_id/:date/:periodical', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const { group_id, date, periodical } = req.params;

      const result = await tasksService.getTasksByUserId(user_id, group_id, date, <Periodical>periodical);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 집안일 조회 */
  router.get('/:task_id', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const task_id = req.params.task_id;

      const result = await tasksService.getTask(user_id, task_id);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 집안일 수정 */
  router.put('/:task_id', validateBody(UpdateTaskDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const task_id = req.params.task_id;

      const result = await tasksService.updateTask(user_id, task_id, req.body);

      return res.status(200).json(responseInterceptor(req, result));
    } catch (err) {
      return next(err);
    }
  });

  /** 집안일 삭제 */
  router.delete('/:task_id', async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const task_id = req.params.task_id;

      await tasksService.deleteTask(user_id, task_id);

      return res.status(200).json(responseInterceptor(req));
    } catch (err) {
      return next(err);
    }
  });

  /** 집안일 완료 여부 수정 */
  router.put('/:task_id/user', validateBody(UpdateTaskUserDto), async (req, res, next) => {
    try {
      const user_id = req.user?.user_id;
      const task_id = req.params.task_id;

      await tasksService.updateTaskUser(user_id, task_id, req.body.is_end);

      return res.status(200).json(responseInterceptor(req));
    } catch (err) {
      return next(err);
    }
  });

  /** 반복 집안일 생성 */
  router.post('/schedule', async (req, res, next) => {
    try {
      await tasksService.scheduleCreateRepeatTasks();

      return res.status(200).json(responseInterceptor(req));
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
