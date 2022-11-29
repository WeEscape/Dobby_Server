import { CreateTaskDto } from '../dtos/tasks/createTask.dto';
import { UpdateTaskDto } from '../dtos/tasks/updateTask.dto';
import { Task } from '../entities/task.entity';
import { TaskUser } from '../entities/taskUser.entity';
import { ForbiddenError } from '../exceptions/Forbidden.exception';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { Periodical, TasksRepository } from '../repositories/tasks.repository';
import { errorMessage } from '../utils/message.util';
import { CategoriesService } from './categories.service';
import { GroupsService } from './groups.service';

export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly groupsService: GroupsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /** id별 집안일 조회 */
  private async getTaskByTaskId(user_id: string, task_id: string): Promise<Task> {
    const task = <Task>await this.tasksRepository.findTaskByTaskId(task_id);
    if (!task) {
      throw new NotFoundError(errorMessage.notFound);
    }

    return task;
  }

  /** 집안일 대상자 검증 */
  private async validateUserInTaskUser(user_id: string, task_id: string): Promise<void> {
    const task = <Task>await this.tasksRepository.findTaskByTaskId(task_id);
    if (!task) {
      throw new NotFoundError(errorMessage.notFound);
    }
    const taskUserList = await this.tasksRepository.findTaskUserByTaskId(task_id);
    if (taskUserList.filter(taskUser => taskUser.user_id === user_id).length === 0) {
      throw new ForbiddenError(errorMessage.forbidden);
    }
  }

  /** 집안일 대상자, 집안일 생성자 검증 */
  private async validateUserInTaskUserOrCreator(user_id: string, task_id: string): Promise<void> {
    const task = await this.getTaskByTaskId(user_id, task_id);
    const taskUserList = await this.tasksRepository.findTaskUserByTaskId(task_id);
    if (task.user_id !== user_id && taskUserList.filter(taskUser => taskUser.user_id === user_id).length === 0) {
      throw new ForbiddenError(errorMessage.forbidden);
    }
  }

  /** 집안일 생성 */
  async createTask(
    user_id: string,
    createTaskDto: CreateTaskDto,
  ): Promise<{ task: Task; task_user_list: TaskUser[] | [] }> {
    await this.categoriesService.validateUserInCategoryGroup(user_id, createTaskDto.category_id);
    if (createTaskDto?.add_user_ids) {
      for await (const user_id of createTaskDto.add_user_ids) {
        await this.categoriesService.validateUserInCategoryGroup(user_id, createTaskDto.category_id);
      }
    }

    const task = await this.tasksRepository.createTask({ user_id, ...createTaskDto });
    const taskUserList = await this.tasksRepository.findTaskUserByTaskId(task.task_id);

    return { task, task_user_list: taskUserList };
  }

  /** 집안일 목록 조회 */
  async getTasks(
    user_id: string,
    group_id: string,
    date: string,
    periodical: Periodical,
  ): Promise<{ task_list: Task[] | [] }> {
    await this.groupsService.validateUserInGroup(user_id, group_id);

    const taskList = await this.tasksRepository.findTasksByUserIdAndGroupId(user_id, group_id, date, periodical);

    return { task_list: taskList };
  }

  /** 집안일 조회 */
  async getTask(user_id: string, task_id: string): Promise<{ task: Task; task_user_list: TaskUser[] | [] }> {
    const task = await this.getTaskByTaskId(user_id, task_id);
    const taskUserList = await this.tasksRepository.findTaskUserByTaskId(task_id);

    return { task, task_user_list: taskUserList };
  }

  /** 집안일 수정 */
  async updateTask(
    user_id: string,
    task_id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<{ task: Task; task_user_list: TaskUser[] | [] }> {
    await this.validateUserInTaskUserOrCreator(user_id, task_id);

    const task = await this.tasksRepository.updateTask({ task_id, ...updateTaskDto });
    const taskUserList = await this.tasksRepository.findTaskUserByTaskId(task_id);

    return { task, task_user_list: taskUserList };
  }

  /** 집안일 삭제 */
  async deleteTask(user_id: string, task_id: string): Promise<void> {
    await this.validateUserInTaskUserOrCreator(user_id, task_id);

    await this.tasksRepository.deleteTask({ task_id });
  }

  /** 집안일 완료 여부 수정 */
  async updateTaskUser(user_id: string, task_id: string, is_end: number): Promise<void> {
    await this.validateUserInTaskUser(user_id, task_id);

    await this.tasksRepository.updateTaskUser({ task_id, user_id, is_end });
  }

  /** 반복 집안일 생성 */
  async scheduleCreateRepeatTasks(): Promise<void> {
    await this.tasksRepository.createAfter2MonthTasks();
  }
}
