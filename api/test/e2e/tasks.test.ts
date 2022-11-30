import supertest from 'supertest';
import { Task } from '../../src/entities/task.entity';
import { TaskUser } from '../../src/entities/taskUser.entity';
import { errorMessage } from '../../src/utils/message.util';
import { loginData } from '../datas/auth/login.data';
import { registerData } from '../datas/auth/register.data';
import { createCategoryData } from '../datas/categories/createCategory.data';
import { createTaskData } from '../datas/tasks/createTask.data';
import { updateTaskData } from '../datas/tasks/updateTask.data';
import { TestGenerator } from '../repositories/base/generator';
import { server, testConatiner } from '../server';

const request = supertest(server.server);

const testTasksRepository = testConatiner.getTasksRepository();

let access_token1: string;
let access_token2: string;

describe('Tasks', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await request.post('/api/auth/register').send(registerData.kakao);
    const result1 = await request.post('/api/auth/login').send(loginData.kakao);

    access_token1 = result1.body.data.access_token;

    await request.post('/api/auth/register').send(registerData.apple);
    const result2 = await request.post('/api/auth/login').send(loginData.apple);

    access_token2 = result2.body.data.access_token;

    await request.post('/api/groups').set('authorization', `Bearer ${access_token1}`).send({ group_title: 'group1' });
    await request
      .post('/api/categories')
      .set('authorization', `Bearer ${access_token1}`)
      .send(createCategoryData.success);
  });

  describe('create task', () => {
    it('success without repeat', async () => {
      const { statusCode, body } = await request
        .post('/api/tasks')
        .set('authorization', `Bearer ${access_token1}`)
        .send(createTaskData.successWithoutRepeat);

      expect(statusCode).toBe(200);
      expect(body.data.task.task_id).toBe('TS3030303030303030');
      expect(body.data.task.user_id).toBe('US1111111111111111');
      expect(body.data.task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(body.data.task.task_title).toBe(createTaskData.successWithoutRepeat.task_title);
      expect(body.data.task.excute_at).toEqual(createTaskData.successWithoutRepeat.excute_at);
      expect(body.data.task.start_repeat_task_id).toBeNull();
    });

    it('success with repeat', async () => {
      const { statusCode, body } = await request
        .post('/api/tasks')
        .set('authorization', `Bearer ${access_token1}`)
        .send(createTaskData.successWithRepeat);

      expect(statusCode).toBe(200);
      expect(body.data.task.task_id).toBe('TS3131313131313131');
      expect(body.data.task.user_id).toBe('US1111111111111111');
      expect(body.data.task.category_id).toBe(createTaskData.successWithRepeat.category_id);
      expect(body.data.task.task_title).toBe(createTaskData.successWithRepeat.task_title);
      expect(body.data.task.repeat_cycle).toBe(createTaskData.successWithRepeat.repeat_cycle);
      expect(body.data.task.end_repeat_at).toBe(createTaskData.successWithRepeat.end_repeat_at);
      expect(body.data.task.excute_at).toBe(createTaskData.successWithRepeat.excute_at);
      expect(body.data.task.start_repeat_task_id).toBe('TS3131313131313131');
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .post('/api/tasks')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ ...createTaskData.successWithoutRepeat, add_user_ids: [] });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('add_user_ids'));
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .post('/api/tasks')
        .set('authorization', `Bearer ${access_token2}`)
        .send(createTaskData.successWithoutRepeat);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('get tasks', () => {
    it('daily task list', async () => {
      const { statusCode, body } = await request
        .get('/api/tasks/group/GR2020202020202020/2022-11-19/daily')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);
      body.data.task_list.forEach((task: Task) => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(new Date(task.excute_at).getDate()).toBe(new Date('2022-11-19').getDate());
      });
    });

    it('weekly task list', async () => {
      const { statusCode, body } = await request
        .get('/api/tasks/group/GR2020202020202020/2022-11-19/weekly')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);
      body.data.task_list.forEach((task: Task) => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(new Date(task.excute_at).getDate()).toBeLessThan(new Date('2022-11-19').getDate() + 7);
        expect(new Date(task.excute_at).getDate()).toBeGreaterThan(new Date('2022-11-19').getDate() - 7);
      });
    });

    it('monthly task list', async () => {
      const { statusCode, body } = await request
        .get('/api/tasks/group/GR2020202020202020/2022-11-19/monthly')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);
      body.data.task_list.forEach((task: Task) => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(new Date(task.excute_at).getMonth()).toBe(new Date('2022-11-19').getMonth());
      });
    });

    it('not found group', async () => {
      const { statusCode, body } = await request
        .get('/api/tasks/group/GR4444444444444444/2022-11-19/daily')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .get('/api/tasks/group/GR2020202020202020/2022-11-19/daily')
        .set('authorization', `Bearer ${access_token2}`);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('get task', () => {
    it('task, task user list', async () => {
      const { statusCode, body } = await request
        .get('/api/tasks/TS3030303030303030')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);
      expect(body.data.task.task_id).toBe('TS3030303030303030');
      expect(body.data.task.user_id).toBe('US1111111111111111');
      expect(body.data.task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(body.data.task.task_title).toBe(createTaskData.successWithoutRepeat.task_title);
      expect(body.data.task.excute_at).toBe(createTaskData.successWithoutRepeat.excute_at);
      expect(body.data.task.start_repeat_task_id).toBeNull();

      body.data.task.task_user_list?.forEach((task_user: TaskUser) => {
        expect(createTaskData.successWithoutRepeat.add_user_ids).toContain(task_user.user_id);
        expect(typeof task_user.is_end).toBe('number');
      });
    });

    it('not found task', async () => {
      const { statusCode, body } = await request
        .get('/api/tasks/TS5555555555555555')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });
  });

  describe('update task user', () => {
    it('success', async () => {
      const { statusCode } = await request
        .put('/api/tasks/TS3030303030303030/user')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ is_end: 1 });

      expect(statusCode).toBe(200);

      const task = <Task>await testTasksRepository.findTaskByTaskId('TS3030303030303030');

      task.task_user_list?.forEach(task_user => {
        if (task_user.user_id === 'US1111111111111111') {
          expect(task_user.is_end).toBe(1);
        }
      });
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .put('/api/tasks/TS3030303030303030/user')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ is_end: '1' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('is_end'));
    });

    it('not found task', async () => {
      const { statusCode, body } = await request
        .put('/api/tasks/TS5555555555555555/user')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ is_end: 1 });

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not user in task', async () => {
      const { statusCode, body } = await request
        .put('/api/tasks/TS3030303030303030/user')
        .set('authorization', `Bearer ${access_token2}`)
        .send({ is_end: 1 });

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('update task', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .put('/api/tasks/TS3030303030303030')
        .set('authorization', `Bearer ${access_token1}`)
        .send(updateTaskData.success);

      expect(statusCode).toBe(200);
      expect(body.data.task.task_id).toBe('TS3030303030303030');
      expect(body.data.task.user_id).toBe('US1111111111111111');
      expect(body.data.task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(body.data.task.task_title).toBe(updateTaskData.success.task_title);
      expect(body.data.task.excute_at).toBe(createTaskData.successWithoutRepeat.excute_at);
      expect(body.data.task.start_repeat_task_id).toBeNull();

      body.data.task.task_user_list?.forEach((task_user: TaskUser) => {
        expect(updateTaskData.success.delete_user_ids).not.toContain(task_user.user_id);
      });
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .put('/api/tasks/TS3030303030303030')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ ...updateTaskData.success, add_user_ids: [] });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('add_user_ids'));
    });

    it('not found task', async () => {
      const { statusCode, body } = await request
        .put('/api/tasks/TS5555555555555555')
        .set('authorization', `Bearer ${access_token1}`)
        .send(updateTaskData.success);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not user in task or creator', async () => {
      const { statusCode, body } = await request
        .put('/api/tasks/TS3030303030303030')
        .set('authorization', `Bearer ${access_token2}`)
        .send(updateTaskData.success);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('delete task', () => {
    it('not user in task or creator', async () => {
      const { statusCode, body } = await request
        .delete('/api/tasks/TS3030303030303030')
        .set('authorization', `Bearer ${access_token2}`)
        .send(updateTaskData.success);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });

    it('success', async () => {
      const { statusCode } = await request
        .delete('/api/tasks/TS3030303030303030')
        .set('authorization', `Bearer ${access_token1}`)
        .send(updateTaskData.success);

      expect(statusCode).toBe(200);

      const task = <undefined>await testTasksRepository.findTaskByTaskId('TS3030303030303030');

      expect(task).toBeUndefined();
    });

    it('not found task', async () => {
      const { statusCode, body } = await request
        .delete('/api/tasks/TS5555555555555555')
        .set('authorization', `Bearer ${access_token1}`)
        .send(updateTaskData.success);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });
  });

  afterAll(async () => {
    await testTasksRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
      { query: `DELETE FROM TASKS;` },
      { query: `DELETE FROM TASKS_USERS;` },
    ]);
  });
});
