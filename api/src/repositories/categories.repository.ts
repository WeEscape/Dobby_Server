import { Category } from '../entities/category.entity';
import { CategoryInfo } from '../interfaces/categoryInfo.interface';
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
  async findCategoryByCategoryId(category_id: string, options?: SelectOptions): Promise<CategoryInfo | undefined> {
    const selectField = options?.select.toString() || 'CATEGORIES.*, GROUP_CONCAT(TASKS.task_id) AS task_ids';

    const categoryInfo = (<any[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM CATEGORIES
          LEFT JOIN TASKS USING(category_id)
          WHERE CATEGORIES.category_id = ?
          GROUP BY CATEGORIES.category_id;
        `,
        params: [category_id],
      },
    ]))[0][0];

    if (categoryInfo?.task_ids) {
      categoryInfo.task_ids = categoryInfo.task_ids.split(',');
    }

    return categoryInfo;
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
  async createCategory(options: { user_id: string; group_id: string; category_title: string }): Promise<CategoryInfo> {
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

    return <CategoryInfo>await this.findCategoryByCategoryId(categoryId);
  }

  /** 카테고리 수정 */
  async updateCategory(options: { category_id: string; category_title: string }): Promise<CategoryInfo> {
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

    return <CategoryInfo>await this.findCategoryByCategoryId(options.category_id);
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
