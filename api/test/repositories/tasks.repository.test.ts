import { Task } from '../../src/entities/task.entity';
import { TaskUser } from '../../src/entities/taskUser.entity';
import { registerData } from '../datas/auth/register.data';
import { createTaskData } from '../datas/tasks/createTask.data';
import { updateTaskData } from '../datas/tasks/updateTask.data';
import { testConatiner } from '../server';
import { TestGenerator } from './base/generator';

const testAuthRepository = testConatiner.getAuthRepository();
const testGroupsRepository = testConatiner.getGroupsRepository();
const testCategoriesRepository = testConatiner.getCategoriesRepository();
const testTasksRepository = testConatiner.getTasksRepository();

describe('Tasks Repository', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthRepository.createUser(registerData.kakao);
    await testAuthRepository.createUser(registerData.apple);
    await testGroupsRepository.createGroup({ user_id: 'US1111111111111111', group_title: 'group1' });
    await testCategoriesRepository.createCategory({
      user_id: 'US1111111111111111',
      group_id: 'GR2020202020202020',
      category_title: 'category1',
    });
  });

  describe('create task', () => {
    it('sucess without repeat', async () => {
      const task = <Task>(
        await testTasksRepository.createTask({ user_id: 'US1111111111111111', ...createTaskData.successWithoutRepeat })
      );

      expect(task.task_id).toBe('TS3030303030303030');
      expect(task.user_id).toBe('US1111111111111111');
      expect(task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(task.task_title).toBe(createTaskData.successWithoutRepeat.task_title);
      expect(task.excute_at.toISOString()).toBe(createTaskData.successWithoutRepeat.excute_at);
      expect(task.start_repeat_task_id).toBeNull();
      task.task_user_list?.every(task_user => {
        expect(createTaskData.successWithoutRepeat.add_user_ids).toContain(task_user.user_id);
        expect(task_user.is_end).toBe(0);
      });
    });

    it('success with repeat', async () => {
      const task = <Task>(
        await testTasksRepository.createTask({ user_id: 'US1111111111111111', ...createTaskData.successWithRepeat })
      );

      expect(task.task_id).toBe('TS3131313131313131');
      expect(task.user_id).toBe('US1111111111111111');
      expect(task.category_id).toBe(createTaskData.successWithRepeat.category_id);
      expect(task.task_title).toBe(createTaskData.successWithRepeat.task_title);
      expect(task.repeat_cycle).toBe(createTaskData.successWithRepeat.repeat_cycle);
      expect(task.end_repeat_at?.toISOString()).toBe(createTaskData.successWithRepeat.end_repeat_at);
      expect(task.excute_at.toISOString()).toBe(createTaskData.successWithRepeat.excute_at);
      expect(task.start_repeat_task_id).toEqual('TS3131313131313131');
      task.task_user_list?.every(task_user => {
        expect(createTaskData.successWithRepeat.add_user_ids).toContain(task_user.user_id);
        expect(task_user.is_end).toBe(0);
      });
    });
  });

  describe('find task by task id', () => {
    it('task', async () => {
      const task = <Task>await testTasksRepository.findTaskByTaskId('TS3030303030303030');

      expect(task.task_id).toBe('TS3030303030303030');
      expect(task.user_id).toBe('US1111111111111111');
      expect(task.category_id).toBe(createTaskData.successWithoutRepeat.category_id);
      expect(task.task_title).toBe(createTaskData.successWithoutRepeat.task_title);
      expect(task.excute_at.toISOString()).toBe(createTaskData.successWithoutRepeat.excute_at);
      expect(task.start_repeat_task_id).toBeNull();
    });

    it('undefined', async () => {
      const task = <undefined>await testTasksRepository.findTaskByTaskId('TS5555555555555555');

      expect(task).toBeUndefined();
    });
  });

  describe('find task by user id and group id', () => {
    it('daily task list', async () => {
      const taskList = <Task[]>(
        await testTasksRepository.findTasksByUserIdAndGroupId(
          'US1111111111111111',
          'GR2020202020202020',
          '2022-11-19',
          'daily',
        )
      );

      taskList.forEach(task => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(task.excute_at.getDate()).toBe(new Date('2022-11-19').getDate());
      });
    });

    it('weekly task list', async () => {
      const taskList = <Task[]>(
        await testTasksRepository.findTasksByUserIdAndGroupId(
          'US1111111111111111',
          'GR2020202020202020',
          '2022-11-19',
          'weekly',
        )
      );

      taskList.forEach(task => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(task.excute_at.getDate()).toBeLessThan(new Date('2022-11-19').getDate() + 7);
        expect(task.excute_at.getDate()).toBeGreaterThan(new Date('2022-11-19').getDate() - 7);
      });
    });

    it('monthly task list', async () => {
      const taskList = <Task[]>(
        await testTasksRepository.findTasksByUserIdAndGroupId(
          'US1111111111111111',
          'GR2020202020202020',
          '2022-11-19',
          'monthly',
        )
      );

      taskList.forEach(task => {
        expect(typeof task.task_id).toBe('string');
        expect(typeof task.category_id).toBe('string');
        expect(typeof task.task_title).toBe('string');
        expect(task.excute_at.getMonth()).toBe(new Date('2022-11-19').getMonth());
      });
    });

    it('no data', async () => {
      const task = <[]>(
        await testTasksRepository.findTasksByUserIdAndGroupId(
          'US1111111111111111',
          'GR4444444444444444',
          '2022-11-19',
          'daily',
        )
      );

      expect(task).toEqual([]);
    });
  });

  describe('update task user', () => {
    it('success', async () => {
      await testTasksRepository.updateTaskUser({
        task_id: 'TS3030303030303030',
        user_id: 'US1111111111111111',
        is_end: 1,
      });

      const task = <Task>await testTasksRepository.findTaskByTaskId('TS3030303030303030');

      task.task_user_list?.forEach(task_user => {
        if (task_user.user_id === 'US1111111111111111') {
          expect(task_user.is_end).toBe(1);
        }
      });
    });
  });

  describe('update task', () => {
    it('success', async () => {
      const task = <Task>(
        await testTasksRepository.updateTask({ task_id: 'TS3030303030303030', ...updateTaskData.success })
      );

      expect(task.task_title).toBe(updateTaskData.success.task_title);

      task.task_user_list?.forEach(task_user => {
        expect(updateTaskData.success.delete_user_ids).not.toContain(task_user.user_id);
      });
    });
  });

  describe('delete task', () => {
    it('success', async () => {
      await testTasksRepository.deleteTask({ task_id: 'TS3030303030303030' });

      const task = <undefined>await testTasksRepository.findTaskByTaskId('TS3030303030303030');

      expect(task).toBeUndefined();
    });
  });

  afterAll(async () => {
    await testTasksRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
      { query: `DELETE FROM TASKS;` },
      { query: `DELETE FROM TASKS_USERS;` },
    ]);
  });
});
