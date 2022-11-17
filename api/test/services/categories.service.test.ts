import { errorMessage } from '../../src/utils/message.util';
import { registerData } from '../datas/auth/register.data';
import { createCategoryData } from '../datas/categories/createCategory.data';
import { TestGenerator } from '../repositories/base/generator';
import { testConatiner } from '../server';

const testCategoriesRepository = testConatiner.getCategoriesRepository();
const testAuthService = testConatiner.getAuthService();
const testGroupsService = testConatiner.getGroupsService();
const testCategoriesService = testConatiner.getCategoriesService();

describe('Categories Service', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthService.register(registerData.kakao);
    await testAuthService.register(registerData.apple);
    await testGroupsService.createGroup('US111111111111', 'group1');
  });

  describe('create category', () => {
    it('success', async () => {
      const result = await testCategoriesService.createCategory('US111111111111', createCategoryData.success);

      expect(result.category_info.category_id).toBe('CT555555555555');
      expect(result.category_info.user_id).toBe('US111111111111');
      expect(result.category_info.group_id).toBe(createCategoryData.success.group_id);
      expect(result.category_info.category_title).toBe(createCategoryData.success.category_title);
    });

    it('not found group', async () => {
      await expect(
        async () => await testCategoriesService.createCategory('US111111111111', createCategoryData.notfoundGroup),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('duplicate category title', async () => {
      await expect(
        async () =>
          await testCategoriesService.createCategory('US111111111111', createCategoryData.duplicateCategoryTitle),
      ).rejects.toThrowError(errorMessage.duplicate);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.createCategory('US222222222222', createCategoryData.success),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('get categories', () => {
    it('success', async () => {
      const result = await testCategoriesService.getCategories('US111111111111', 'GR333333333333');

      result.category_list.forEach(category => {
        expect(typeof category.category_id).toBe('string');
        expect(typeof category.user_id).toBe('string');
        expect(category.group_id).toBe('GR333333333333');
        expect(typeof category.category_title).toBe('string');
      });
    });

    it('not found group', async () => {
      await expect(
        async () => await testCategoriesService.getCategories('US111111111111', 'GR444444444444'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.getCategories('US222222222222', 'GR333333333333'),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('get category', () => {
    it('success', async () => {
      const result = await testCategoriesService.getCategory('US111111111111', 'CT555555555555');

      expect(result.category_info.category_id).toBe('CT555555555555');
      expect(result.category_info.user_id).toBe('US111111111111');
      expect(result.category_info.group_id).toBe(createCategoryData.success.group_id);
      expect(result.category_info.category_title).toBe(createCategoryData.success.category_title);
    });

    it('not found category', async () => {
      await expect(
        async () => await testCategoriesService.getCategory('US111111111111', 'CT444444444444'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.getCategory('US222222222222', 'CT555555555555'),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('update category', () => {
    it('success', async () => {
      const result = await testCategoriesService.updateCategory('US111111111111', 'CT555555555555', 'update_category1');

      expect(result.category_info.category_id).toBe('CT555555555555');
      expect(result.category_info.user_id).toBe('US111111111111');
      expect(result.category_info.group_id).toBe(createCategoryData.success.group_id);
      expect(result.category_info.category_title).toBe('update_category1');
    });

    it('not found category', async () => {
      await expect(
        async () => await testCategoriesService.updateCategory('US111111111111', 'CT444444444444', 'update_category1'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('duplicate category title', async () => {
      await testCategoriesService.createCategory('US111111111111', {
        ...createCategoryData.success,
        category_title: 'category2',
      });

      await expect(
        async () => await testCategoriesService.updateCategory('US111111111111', 'CT555555555555', 'category2'),
      ).rejects.toThrowError(errorMessage.duplicate);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.updateCategory('US222222222222', 'CT555555555555', 'update_category1'),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('delete category', () => {
    it('success', async () => {
      await testCategoriesService.deleteeCategory('US111111111111', 'CT555555555555');

      const categoryInfo = <undefined>await testCategoriesRepository.findCategoryByCategoryId('CT555555555555');

      expect(categoryInfo).toBeUndefined();
    });

    it('not found category', async () => {
      await expect(
        async () => await testCategoriesService.deleteeCategory('US111111111111', 'CT444444444444'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.deleteeCategory('US222222222222', 'CT666666666666'),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  afterAll(async () => {
    await testCategoriesRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
