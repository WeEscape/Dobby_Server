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
    await testGroupsService.createGroup('US1111111111111111', 'group1');
  });

  describe('create category', () => {
    it('success', async () => {
      const result = await testCategoriesService.createCategory('US1111111111111111', createCategoryData.success);

      expect(result.category.category_id).toBe('CT2929292929292929');
      expect(result.category.user_id).toBe('US1111111111111111');
      expect(result.category.group_id).toBe(createCategoryData.success.group_id);
      expect(result.category.category_title).toBe(createCategoryData.success.category_title);
    });

    it('not found group', async () => {
      await expect(
        async () => await testCategoriesService.createCategory('US1111111111111111', createCategoryData.notfoundGroup),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('duplicate category title', async () => {
      await expect(
        async () =>
          await testCategoriesService.createCategory('US1111111111111111', createCategoryData.duplicateCategoryTitle),
      ).rejects.toThrowError(errorMessage.duplicate);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.createCategory('US1010101010101010', createCategoryData.success),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('get categories', () => {
    it('success', async () => {
      const result = await testCategoriesService.getCategories('US1111111111111111', 'GR2020202020202020');

      result.category_list.forEach(category => {
        expect(typeof category.category_id).toBe('string');
        expect(typeof category.user_id).toBe('string');
        expect(category.group_id).toBe('GR2020202020202020');
        expect(typeof category.category_title).toBe('string');
      });
    });

    it('not found group', async () => {
      await expect(
        async () => await testCategoriesService.getCategories('US1111111111111111', 'GR4444444444444444'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.getCategories('US1010101010101010', 'GR2020202020202020'),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('get category', () => {
    it('success', async () => {
      const result = await testCategoriesService.getCategory('US1111111111111111', 'CT2929292929292929');

      expect(result.category.category_id).toBe('CT2929292929292929');
      expect(result.category.user_id).toBe('US1111111111111111');
      expect(result.category.group_id).toBe(createCategoryData.success.group_id);
      expect(result.category.category_title).toBe(createCategoryData.success.category_title);
    });

    it('not found category', async () => {
      await expect(
        async () => await testCategoriesService.getCategory('US1111111111111111', 'CT1111111111111111'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.getCategory('US1010101010101010', 'CT2929292929292929'),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('update category', () => {
    it('success', async () => {
      const result = await testCategoriesService.updateCategory(
        'US1111111111111111',
        'CT2929292929292929',
        'update_category1',
      );

      expect(result.category.category_id).toBe('CT2929292929292929');
      expect(result.category.user_id).toBe('US1111111111111111');
      expect(result.category.group_id).toBe(createCategoryData.success.group_id);
      expect(result.category.category_title).toBe('update_category1');
    });

    it('not found category', async () => {
      await expect(
        async () =>
          await testCategoriesService.updateCategory('US1111111111111111', 'CT1111111111111111', 'update_category1'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('duplicate category title', async () => {
      await testCategoriesService.createCategory('US1111111111111111', {
        ...createCategoryData.success,
        category_title: 'category2',
      });

      await expect(
        async () => await testCategoriesService.updateCategory('US1111111111111111', 'CT2929292929292929', 'category2'),
      ).rejects.toThrowError(errorMessage.duplicate);
    });

    it('not group user', async () =>
      await expect(
        async () =>
          await testCategoriesService.updateCategory('US1010101010101010', 'CT2929292929292929', 'update_category1'),
      ).rejects.toThrowError(errorMessage.forbidden));
  });

  describe('delete category', () => {
    it('success', async () => {
      await testCategoriesService.deleteCategory('US1111111111111111', 'CT2929292929292929');

      const category = <undefined>await testCategoriesRepository.findCategoryByCategoryId('CT2929292929292929');

      expect(category).toBeUndefined();
    });

    it('not found category', async () => {
      await expect(
        async () => await testCategoriesService.deleteCategory('US1111111111111111', 'CT1111111111111111'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () =>
      await expect(
        async () => await testCategoriesService.deleteCategory('US1010101010101010', 'CT2525252525252525'),
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
