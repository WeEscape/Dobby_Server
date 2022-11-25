import { Category } from '../entities/category.entity';
import { Task } from '../entities/task.entity';
import { RdbmsRepository, SelectOptions } from './base/rdbms.repository';

export class CategoriesRepository extends RdbmsRepository {
  /** 그룹, 카테고리 제목별 카테고리 조회 */
  async findCategoryByGroupIdAndCategoryTitle(
    group_id: string,
    category_title: string,
    options?: SelectOptions,
  ): Promise<Category | undefined> {
    const selectField = options?.select.toString() || 'CATEGORIES.*';

    return (<Category[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM CATEGORIES
          WHERE group_id = ?
            AND category_title = ?;
        `,
        params: [group_id, category_title],
      },
    ]))[0][0];
  }

  /** id별 카테고리 조회 */
  async findCategoryByCategoryId(category_id: string, options?: SelectOptions): Promise<Category | undefined> {
    const selectField = options?.select.toString() || 'CATEGORIES.*';

    return (<Category[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM CATEGORIES
          WHERE category_id = ?;
        `,
        params: [category_id],
      },
    ]))[0][0];
  }

  /** 카테고리별 집안일 목록 조회 */
  async findTasksByCategoryId(category_id: string, options?: SelectOptions): Promise<Task[] | []> {
    const selectField = options?.select.toString() || 'TASKS.*';

    return (<Task[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM TASKS
          WHERE category_id = ?;
        `,
        params: [category_id],
      },
    ]))[0];
  }

  /** 그룹별 카테고리 목록 조회 */
  async findCategoriesByGroupId(group_id: string, options?: SelectOptions): Promise<Category[] | []> {
    const selectField = options?.select.toString() || 'CATEGORIES.*';

    return (<Category[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM CATEGORIES
          WHERE group_id = ?;
        `,
        params: [group_id],
      },
    ]))[0];
  }

  /** 카테고리 생성 */
  async createCategory(options: { user_id: string; group_id: string; category_title: string }): Promise<Category> {
    const categoryId = 'CT' + this.generateId();

    await this.sendQuerys([
      {
        query: `
          INSERT INTO CATEGORIES(
            category_id,
            user_id,
            group_id,
            category_title
          ) VALUES (
            ?,
            ?,
            ?,
            ?
          );
        `,
        params: [categoryId, options.user_id, options.group_id, options.category_title],
      },
    ]);

    return <Category>await this.findCategoryByCategoryId(categoryId);
  }

  /** 카테고리 수정 */
  async updateCategory(options: { category_id: string; category_title: string }): Promise<Category> {
    await this.sendQuerys([
      {
        query: `
          UPDATE CATEGORIES SET
            category_title = ?
          WHERE category_id = ?;
        `,
        params: [options.category_title, options.category_id],
      },
    ]);

    return <Category>await this.findCategoryByCategoryId(options.category_id);
  }

  /** 카테고리 삭제 */
  async deleteCategory(options: { category_id: string }): Promise<void> {
    await this.sendQuerys([
      {
        query: `
          DELETE CATEGORIES, TASKS, TASKS_USERS
          FROM CATEGORIES
          LEFT JOIN TASKS USING(category_id)
          LEFT JOIN TASKS_USERS USING(task_id)
          WHERE category_id = ?;
        `,
        params: [options.category_id],
      },
    ]);
  }
}
