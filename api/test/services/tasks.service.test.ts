import { TaskUser } from '../../src/entities/taskUser.entity';
import { errorMessage } from '../../src/utils/message.util';
import { registerData } from '../datas/auth/register.data';
import { createCategoryData } from '../datas/categories/createCategory.data';
import { createTaskData } from '../datas/tasks/createTask.data';
import { updateTaskData } from '../datas/tasks/updateTask.data';
import { TestGenerator } from '../repositories/base/generator';
import { testConatiner } from '../server';

const testTasksRepository = testConatiner.getTasksRepository();
const testAuthService = testConatiner.getAuthService();
const testGroupsService = testConatiner.getGroupsService();
const testCategoriesService = testConatiner.getCategoriesService();
const testTasksService = testConatiner.getTasksService();

describe('Tasks Service', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthService.register(registerData.kakao);
    await testAuthService.register(registerData.apple);
    await testGroupsService.createGroup('US1111111111111111', 'group1');
    await testCategoriesService.createCategory('US1111111111111111', createCategoryData.success);
  });

  describe('create task', () => {
    it('success without repeat', async () => {
      const result = await testTasksService.createTask('US1111111111111111', createTaskData.successWithoutRepeat);

      expect(result.task.task_id).toBe('TS3030303030303030');
      expect(result.task.user_id).toBe('US1111111111111111');
      expect(result.task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(result.task.task_title).toBe(createTaskData.successWithoutRepeat.task_title);
      expect(result.task.excute_at.toISOString()).toBe(createTaskData.successWithoutRepeat.excute_at);
      expect(result.task.start_repeat_task_id).toBeNull();
    });

    it('success with repeat', async () => {
      const result = await testTasksService.createTask('US1111111111111111', createTaskData.successWithRepeat);

      expect(result.task.task_id).toBe('TS3131313131313131');
      expect(result.task.user_id).toBe('US1111111111111111');
      expect(result.task.category_id).toBe(createTaskData.successWithRepeat.category_id);
      expect(result.task.task_title).toBe(createTaskData.successWithRepeat.task_title);
      expect(result.task.repeat_cycle).toBe(createTaskData.successWithRepeat.repeat_cycle);
      expect(result.task.end_repeat_at?.toISOString()).toBe(createTaskData.successWithRepeat.end_repeat_at);
      expect(result.task.excute_at.toISOString()).toBe(createTaskData.successWithRepeat.excute_at);
      expect(result.task.start_repeat_task_id).toBe('TS3131313131313131');
    });

    it('not group user', async () => {
      await expect(
        async () => await testTasksService.createTask('US1010101010101010', createTaskData.successWithoutRepeat),
      ).rejects.toThrowError(errorMessage.forbidden);
    });
  });

  describe('get tasks', () => {
    it('daily task list', async () => {
      const result = await testTasksService.getTasks('US1111111111111111', 'GR2020202020202020', '2022-11-19', 'daily');

      result.task_list.forEach(task => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(task.excute_at.getDate()).toBe(new Date('2022-11-19').getDate());
      });
    });

    it('weekly task list', async () => {
      const result = await testTasksService.getTasks(
        'US1111111111111111',
        'GR2020202020202020',
        '2022-11-19',
        'weekly',
      );

      result.task_list.forEach(task => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(task.excute_at.getDate()).toBeLessThan(new Date('2022-11-19').getDate() + 7);
        expect(task.excute_at.getDate()).toBeGreaterThan(new Date('2022-11-19').getDate() - 7);
      });
    });

    it('monthly task list', async () => {
      const result = await testTasksService.getTasks(
        'US1111111111111111',
        'GR2020202020202020',
        '2022-11-19',
        'monthly',
      );

      result.task_list.forEach(task => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(task.excute_at.getMonth()).toBe(new Date('2022-11-19').getMonth());
      });
    });

    it('not found group', async () => {
      await expect(
        async () => await testTasksService.getTasks('US1111111111111111', 'GR4444444444444444', '2022-11-19', 'daily'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () => {
      await expect(
        async () => await testTasksService.getTasks('US1010101010101010', 'GR2020202020202020', '2022-11-19', 'daily'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });
  });

  describe('get task', () => {
    it('task, task user list', async () => {
      const result = await testTasksService.getTask('US1111111111111111', 'TS3030303030303030');

      expect(result.task.task_id).toBe('TS3030303030303030');
      expect(result.task.user_id).toBe('US1111111111111111');
      expect(result.task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(result.task.task_title).toBe(createTaskData.successWithoutRepeat.task_title);
      expect(result.task.excute_at.toISOString()).toBe(createTaskData.successWithoutRepeat.excute_at);
      expect(result.task.start_repeat_task_id).toBeNull();

      result.task_user_list.forEach(task_user => {
        expect(task_user.task_id).toBe('TS3030303030303030');
        expect(createTaskData.successWithoutRepeat.add_user_ids).toContain(task_user.user_id);
        expect(typeof task_user.is_end).toBe('number');
      });
    });

    it('not found task', async () => {
      await expect(
        async () => await testTasksService.getTask('US1111111111111111', 'TS5555555555555555'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not user in task or creator', async () => {
      await expect(
        async () => await testTasksService.getTask('US1010101010101010', 'TS3030303030303030'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });
  });

  describe('update task user', () => {
    it('success', async () => {
      await testTasksService.updateTaskUser('US1111111111111111', 'TS3030303030303030', 1);

      const taskUserList = <TaskUser[]>await testTasksRepository.findTaskUserByTaskId('TS3030303030303030');

      taskUserList.forEach(taskUser => {
        expect(taskUser.task_id).toBe('TS3030303030303030');

        if (taskUser.user_id === 'US1111111111111111') {
          expect(taskUser.is_end).toBe(1);
        }
      });
    });

    it('not found task', async () => {
      await expect(
        async () => await testTasksService.updateTaskUser('US1111111111111111', 'TS5555555555555555', 1),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not user in task', async () => {
      await expect(
        async () => await testTasksService.updateTaskUser('US1010101010101010', 'TS3030303030303030', 1),
      ).rejects.toThrowError(errorMessage.forbidden);
    });
  });

  describe('update task', () => {
    it('success', async () => {
      const result = await testTasksService.updateTask(
        'US1111111111111111',
        'TS3030303030303030',
        updateTaskData.success,
      );

      expect(result.task.task_id).toBe('TS3030303030303030');
      expect(result.task.user_id).toBe('US1111111111111111');
      expect(result.task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(result.task.task_title).toBe(updateTaskData.success.task_title);
      expect(result.task.excute_at.toISOString()).toBe(createTaskData.successWithoutRepeat.excute_at);
      expect(result.task.start_repeat_task_id).toBeNull();

      result.task_user_list.forEach(task_user => {
        expect(task_user.task_id).toBe('TS3030303030303030');
        expect(updateTaskData.success.delete_user_ids).not.toContain(task_user.user_id);
      });
    });

    it('not found task', async () => {
      await expect(
        async () =>
          await testTasksService.updateTask('US1111111111111111', 'TS5555555555555555', updateTaskData.success),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not user in task or creator', async () => {
      await expect(
        async () =>
          await testTasksService.updateTask('US1010101010101010', 'TS3030303030303030', updateTaskData.success),
      ).rejects.toThrowError(errorMessage.forbidden);
    });
  });

  describe('delete task', () => {
    it('not user in task or creator', async () => {
      await expect(
        async () => await testTasksService.deleteTask('US1010101010101010', 'TS3030303030303030'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });

    it('success', async () => {
      await testTasksService.deleteTask('US1111111111111111', 'TS3030303030303030');

      const task = <undefined>await testTasksRepository.findTaskByTaskId('TS3030303030303030');

      expect(task).toBeUndefined();
    });

    it('not found task', async () => {
      await expect(
        async () => await testTasksService.deleteTask('US1111111111111111', 'TS5555555555555555'),
      ).rejects.toThrowError(errorMessage.notFound);
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
