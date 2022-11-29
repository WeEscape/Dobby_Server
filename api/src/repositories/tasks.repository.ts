import { RepeatCycle, Task } from '../entities/task.entity';
import { TaskUser } from '../entities/taskUser.entity';
import { InternalServerError } from '../exceptions/InternalServer.exception';
import { RdbmsRepository, SelectOptions } from './base/rdbms.repository';

export type Periodical = 'daily' | 'weekly' | 'monthly';

export class TasksRepository extends RdbmsRepository {
  /** 다음 시행일 계산 */
  private getNextExcuteAt = (repeat_cycle: RepeatCycle, excute_at: Date): Date => {
    const excuteAt = new Date(excute_at);
    let nextExcuteAt: Date;

    switch (repeat_cycle) {
      case '1D':
        nextExcuteAt = new Date(excuteAt.setDate(excute_at.getDate() + 1));
        break;
      case '1W':
        nextExcuteAt = new Date(excuteAt.setDate(excute_at.getDate() + 7));
        break;
      case '1M':
        nextExcuteAt = new Date(excuteAt.setMonth(excute_at.getMonth() + 1));
        break;
      default:
        nextExcuteAt = excuteAt;
    }

    return nextExcuteAt;
  };

  /** 2달 뒤 날짜 계산 */
  private getLastDateAfter3Month(): Date {
    const now = new Date();
    now.setMonth(now.getMonth() + 2);
    now.setDate(0);

    return new Date(now);
  }

  /** id별 집안일 조회 */
  async findTaskByTaskId(task_id: string, options?: SelectOptions): Promise<Task | undefined> {
    const selectField = options?.select.toString() || 'TASKS.*';

    const task = (<Task[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM TASKS
          WHERE TASKS.task_id = ?;
        `,
        params: [task_id],
      },
    ]))[0][0];

    return task;
  }

  /** 그룹, 회원별 집안일 목록 조회 */
  async findTasksByUserIdAndGroupId(
    user_id: string,
    group_id: string,
    date: string,
    periodical: Periodical,
    options?: SelectOptions,
  ): Promise<Task[] | []> {
    const periodicalQuery = {
      daily: `DATE_FORMAT(TASKS.excute_at, '%Y%m%d') = DATE_FORMAT('${date}', '%Y%m%d')`,
      weekly: `YEARWEEK(TASKS.excute_at) = YEARWEEK('${date}')`,
      monthly: `DATE_FORMAT(TASKS.excute_at, '%Y%m') = DATE_FORMAT('${date}', '%Y%m')`,
    };

    const selectField = options?.select.toString() || 'TASKS.*';

    const taskList = (<any[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField},
            JSON_ARRAYAGG(
              JSON_OBJECT(
                  'user_id', TASKS_USERS.user_id,
                  'is_end', TASKS_USERS.is_end
              )
            ) AS task_user_list
          FROM TASKS
          LEFT JOIN TASKS_USERS USING(task_id)
          LEFT JOIN CATEGORIES USING(category_id)
          WHERE CATEGORIES.group_id = ?
            AND ${periodicalQuery[periodical]}
          GROUP BY TASKS.task_id;
        `,
        params: [group_id],
      },
    ]))[0];

    taskList.forEach(task => {
      if (task.task_user_list) {
        task.task_user_list = JSON.parse(task.task_user_list);
      }
    });

    return taskList;
  }

  /** id별 집안일 대상자 조회 */
  async findTaskUserByTaskId(task_id: string, options?: SelectOptions): Promise<TaskUser[] | []> {
    const selectField = options?.select.toString() || 'TASKS_USERS.*';

    return (<TaskUser[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM TASKS_USERS
          WHERE task_id = ?;
        `,
        params: [task_id],
      },
    ]))[0];
  }

  /** 집안일 생성 */
  async createTask(options: {
    user_id: string;
    category_id: string;
    task_title: string;
    repeat_cycle?: RepeatCycle;
    memo?: string;
    notice_available?: number;
    end_repeat_at?: string;
    excute_at: string;
    add_user_ids?: string[];
  }): Promise<Task> {
    const querys = [];

    const taskId = 'TS' + this.generateId();
    let excuteAt = new Date(options.excute_at);

    if (options?.repeat_cycle && options?.end_repeat_at) {
      let nextTaskId = taskId;

      while (excuteAt <= this.getLastDateAfter3Month()) {
        querys.push({
          query: `
              INSERT INTO TASKS(
                task_id,
                user_id,
                category_id,
                task_title,
                repeat_cycle,
                memo,
                notice_available,
                end_repeat_at,
                excute_at,
                start_repeat_task_id
              ) VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
              );
            `,
          params: [
            nextTaskId,
            options.user_id,
            options.category_id,
            options.task_title,
            options.repeat_cycle,
            options.memo || null,
            options.notice_available ?? 1,
            new Date(options.end_repeat_at),
            excuteAt,
            taskId,
          ],
        });

        if (options?.add_user_ids) {
          options.add_user_ids.forEach(user_id => {
            querys.push({
              query: `
                  INSERT INTO TASKS_USERS(
                    task_id,
                    user_id
                  ) VALUES (
                    ?,
                    ?
                  );
                `,
              params: [nextTaskId, user_id],
            });
          });
        }

        excuteAt = this.getNextExcuteAt(options.repeat_cycle, excuteAt);
        nextTaskId = 'TS' + this.generateId();
      }
    } else {
      querys.push({
        query: `
              INSERT INTO TASKS(
                task_id,
                user_id,
                category_id,
                task_title,
                repeat_cycle,
                memo,
                notice_available,
                end_repeat_at,
                excute_at
              ) VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
              );
            `,
        params: [
          taskId,
          options.user_id,
          options.category_id,
          options.task_title,
          options.repeat_cycle || null,
          options.memo || null,
          options.notice_available ?? 1,
          options.end_repeat_at || null,
          excuteAt,
        ],
      });

      if (options?.add_user_ids) {
        options.add_user_ids.forEach(user_id => {
          querys.push({
            query: `
                      INSERT INTO TASKS_USERS(
                        task_id,
                        user_id
                      ) VALUES (
                        ?,
                        ?
                      );
                    `,
            params: [taskId, user_id],
          });
        });
      }
    }

    await this.sendQuerys(querys);

    return <Task>await this.findTaskByTaskId(taskId);
  }

  /** 집안일 수정 */
  async updateTask(options: {
    task_id: string;
    category_id?: string;
    task_title?: string;
    memo?: string;
    notice_available?: number;
    excute_at?: string;
    add_user_ids?: string[];
    delete_user_ids?: string[];
  }): Promise<Task> {
    const querys = [];

    querys.push({
      query: `
          UPDATE TASKS SET
            category_id = COALESCE(?, category_id),
            task_title = COALESCE(?, task_title),
            memo = COALESCE(?, memo),
            notice_available = COALESCE(?, notice_available),
            excute_at = COALESCE(?, excute_at)
          WHERE task_id = ?;
        `,
      params: [
        options.category_id || null,
        options.task_title || null,
        options.memo || null,
        options.notice_available ?? null,
        options.excute_at ? new Date(options.excute_at) : null,
        options.task_id,
      ],
    });

    if (options?.add_user_ids) {
      options.add_user_ids.forEach(user_id => {
        querys.push({
          query: `
              INSERT INTO TASKS_USERS(
                task_id,
                user_id
              ) VALUES (
                ?,
                ?
              );
            `,
          params: [options.task_id, user_id],
        });
      });
    }

    if (options?.delete_user_ids) {
      options.delete_user_ids.forEach(user_id => {
        querys.push({
          query: `
              DELETE
              FROM TASKS_USERS
              WHERE task_id = ?
                AND user_id = ?;
            `,
          params: [options.task_id, user_id],
        });
      });
    }

    await this.sendQuerys(querys);

    return <Task>await this.findTaskByTaskId(options.task_id);
  }

  /** 집안일 삭제 */
  async deleteTask(options: { task_id: string }): Promise<void> {
    await this.sendQuerys([
      {
        query: `
          DELETE TASKS, TASKS_USERS
          FROM TASKS
          LEFT JOIN TASKS_USERS USING(task_id)
          WHERE task_id = ?;
        `,
        params: [options.task_id],
      },
    ]);
  }

  /** 집안일 대상자 수정 */
  async updateTaskUser(options: { task_id: string; user_id: string; is_end: number }): Promise<void> {
    await this.sendQuerys([
      {
        query: `
          UPDATE TASKS_USERS SET
            is_end = ?
          WHERE task_id = ?
            AND user_id = ?;
        `,
        params: [options.is_end, options.task_id, options.user_id],
      },
    ]);
  }

  /** 집안일 생성 */
  async createAfter2MonthTasks(): Promise<void> {
    const connection = await this.getConnection();

    try {
      // 트랜잭션 처리
      await connection.beginTransaction();

      let existTaskList: any = null;
      [existTaskList] = await connection.query(
        `
          SELECT TASKS.*, LAST_TASKS.last_excute_at, GROUP_CONCAT(TASKS_USERS.user_id) AS user_ids
          FROM TASKS
          JOIN (
            SELECT start_repeat_task_id, MAX(excute_at) AS last_excute_at FROM TASKS
            WHERE start_repeat_task_id IS NOT NULL
            GROUP BY start_repeat_task_id
          ) AS LAST_TASKS ON TASKS.task_id = LAST_TASKS.start_repeat_task_id
          LEFT JOIN TASKS_USERS USING (task_id)
          WHERE TASKS.end_repeat_at > ?
          GROUP BY TASKS.task_id;
        `,
        [this.getLastDateAfter3Month()],
      );

      for await (const existTask of existTaskList) {
        let excuteAt = this.getNextExcuteAt(existTask.repeat_cycle, existTask.last_excute_at);

        while (excuteAt <= this.getLastDateAfter3Month()) {
          const nextTaskId = 'TS' + this.generateId();

          await connection.query(
            `
                INSERT INTO TASKS(
                  task_id,
                  user_id,
                  category_id,
                  task_title,
                  repeat_cycle,
                  memo,
                  notice_available,
                  end_repeat_at,
                  excute_at,
                  start_repeat_task_id
                ) VALUES (
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?
                );
              `,
            [
              nextTaskId,
              existTask.user_id,
              existTask.category_id,
              existTask.task_title,
              existTask.repeat_cycle,
              existTask.memo,
              existTask.notice_available,
              existTask.end_repeat_at,
              excuteAt,
              existTask.start_repeat_task_id,
            ],
          );

          if (existTask?.user_ids) {
            for await (const user_id of existTask.user_ids.split(',')) {
              await connection.query(
                `
                    INSERT INTO TASKS_USERS(
                      task_id,
                      user_id
                    ) VALUES (
                      ?,
                      ?
                    );
                  `,
                [nextTaskId, user_id],
              );
            }
          }

          excuteAt = this.getNextExcuteAt(existTask.repeat_cycle, excuteAt);
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw new InternalServerError(`Rdbms query: ${err}`);
    } finally {
      connection.release();
    }
  }
}
