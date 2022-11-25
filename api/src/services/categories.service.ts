import { CreateCategoryDto } from '../dtos/categories/createCategory.dto';
import { Category } from '../entities/category.entity';
import { Task } from '../entities/task.entity';
import { BadRequestError } from '../exceptions/BadRequest.exception';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { CategoriesRepository } from '../repositories/categories.repository';
import { errorMessage } from '../utils/message.util';
import { GroupsService } from './groups.service';

export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly groupsService: GroupsService,
  ) {}

  /** 카테고리 제목 검증 */
  private async validateUnqiueCategoryTitle(group_id: string, category_title: string): Promise<void> {
    const existCategory = await this.categoriesRepository.findCategoryByGroupIdAndCategoryTitle(
      group_id,
      category_title,
    );
    if (existCategory) {
      throw new BadRequestError(errorMessage.duplicate);
    }
  }

  /** id별 카테고리 조회 */
  private async getCategoryByCategoryId(user_id: string, category_id: string): Promise<Category> {
    const category = await this.categoriesRepository.findCategoryByCategoryId(category_id);
    if (!category) {
      throw new NotFoundError(errorMessage.notFound);
    }
    await this.groupsService.validateUserInGroup(user_id, category.group_id);

    return category;
  }

  /** 카테고리 그룹 참여 여부 */
  async validateUserInCategoryGroup(user_id: string, category_id: string) {
    await this.getCategoryByCategoryId(user_id, category_id);
  }

  /** 카테고리 생성 */
  async createCategory(
    user_id: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<{ category: Category; task_list: Task[] | [] }> {
    await this.groupsService.validateUserInGroup(user_id, createCategoryDto.group_id);
    await this.validateUnqiueCategoryTitle(createCategoryDto.group_id, createCategoryDto.category_title);

    const category = await this.categoriesRepository.createCategory({ user_id, ...createCategoryDto });
    const taskList = await this.categoriesRepository.findTasksByCategoryId(category.category_id);

    return { category, task_list: taskList };
  }

  /** 카테고리 목록 조회 */
  async getCategories(user_id: string, group_id: string): Promise<{ category_list: Category[] | [] }> {
    await this.groupsService.validateUserInGroup(user_id, group_id);

    const categoryList = <Category[]>await this.categoriesRepository.findCategoriesByGroupId(group_id);

    return { category_list: categoryList };
  }

  /** 카테고리 조회 */
  async getCategory(user_id: string, category_id: string): Promise<{ category: Category; task_list: Task[] | [] }> {
    const category = await this.getCategoryByCategoryId(user_id, category_id);
    const taskList = await this.categoriesRepository.findTasksByCategoryId(category_id);

    return { category, task_list: taskList };
  }

  /** 카테고리 수정 */
  async updateCategory(
    user_id: string,
    category_id: string,
    category_title: string,
  ): Promise<{ category: Category; task_list: Task[] | [] }> {
    const existCategory = await this.getCategoryByCategoryId(user_id, category_id);
    await this.validateUnqiueCategoryTitle(existCategory.group_id, category_title);

    const category = await this.categoriesRepository.updateCategory({ category_id, category_title });
    const taskList = await this.categoriesRepository.findTasksByCategoryId(category_id);

    return { category, task_list: taskList };
  }

  /** 카테고리 삭제 */
  async deleteCategory(user_id: string, category_id: string): Promise<void> {
    await this.validateUserInCategoryGroup(user_id, category_id);

    await this.categoriesRepository.deleteCategory({ category_id });
  }
}
