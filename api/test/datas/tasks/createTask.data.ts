import { CreateTaskDto } from '../../../src/dtos/tasks/createTask.dto';

export const createTaskData: { [key: string]: CreateTaskDto } = {
  successWithoutRepeat: {
    category_id: 'CT2929292929292929',
    task_title: 'task1',
    excute_at: '2022-11-19T00:00:00.000Z',
    add_user_ids: ['US1111111111111111'],
  },
  successWithRepeat: {
    category_id: 'CT2929292929292929',
    task_title: 'task2',
    repeat_cycle: '1W',
    end_repeat_at: '2023-03-19T00:00:00.000Z',
    excute_at: '2022-11-19T00:00:00.000Z',
    add_user_ids: ['US1111111111111111'],
  },
};
