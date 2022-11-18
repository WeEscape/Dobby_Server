import { CreateCategoryDto } from '../dtos/categories/createCategory.dto';
import { Category } from '../entities/category.entity';
import { BadRequestError } from '../exceptions/BadRequest.exception';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { CategoryInfo } from '../interfaces/categoryInfo.interface';
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
  private async getCategoryByCategoryId(user_id: string, category_id: string): Promise<CategoryInfo> {
    const categoryInfo = await this.categoriesRepository.findCategoryByCategoryId(category_id);
    if (!categoryInfo) {
      throw new NotFoundError(errorMessage.notFound);
    }
    await this.groupsService.validateUserInGroup(user_id, categoryInfo.group_id);

    return categoryInfo;
  }

  /** 카테고리 그룹 참여 여부 */
  async validateUserInCategoryGroup(user_id: string, category_id: string) {
    await this.getCategoryByCategoryId(user_id, category_id);
  }

  /** 카테고리 생성 */
  async createCategory(
    user_id: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<{ category_info: CategoryInfo }> {
    await this.groupsService.validateUserInGroup(user_id, createCategoryDto.group_id);
    await this.validateUnqiueCategoryTitle(createCategoryDto.group_id, createCategoryDto.category_title);

    const categoryInfo = await this.categoriesRepository.createCategory({ user_id, ...createCategoryDto });

    return { category_info: categoryInfo };
  }

  /** 카테고리 목록 조회 */
  async getCategories(user_id: string, group_id: string): Promise<{ category_list: Category[] | [] }> {
    await this.groupsService.validateUserInGroup(user_id, group_id);

    const categoryList = <Category[]>await this.categoriesRepository.findCategoriesByGroupId(group_id);

    return { category_list: categoryList };
  }

  /** 카테고리 조회 */
  async getCategory(user_id: string, category_id: string): Promise<{ category_info: CategoryInfo }> {
    const categoryInfo = await this.getCategoryByCategoryId(user_id, category_id);

    return { category_info: categoryInfo };
  }

  /** 카테고리 수정 */
  async updateCategory(
    user_id: string,
    category_id: string,
    category_title: string,
  ): Promise<{ category_info: CategoryInfo }> {
    const existCategoryinfo = await this.getCategoryByCategoryId(user_id, category_id);
    await this.validateUnqiueCategoryTitle(existCategoryinfo.group_id, category_title);

    const categoryInfo = await this.categoriesRepository.updateCategory({ category_id, category_title });

    return { category_info: categoryInfo };
  }

  /** 카테고리 삭제 */
  async deleteeCategory(user_id: string, category_id: string): Promise<void> {
    await this.validateUserInCategoryGroup(user_id, category_id);

    await this.categoriesRepository.deleteCategory({ category_id });
  }
}
