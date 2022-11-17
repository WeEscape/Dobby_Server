import { Category } from '../../src/entities/category.entity';
import { CategoryInfo } from '../../src/interfaces/categoryInfo.interface';
import { registerData } from '../datas/auth/register.data';
import { testConatiner } from '../server';
import { TestGenerator } from './base/generator';

const testAuthRepository = testConatiner.getAuthRepository();
const testGroupsRepository = testConatiner.getGroupsRepository();
const testCategoriesRepository = testConatiner.getCategoriesRepository();

describe('Groups Repository', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthRepository.createUser(registerData.kakao);
    await testAuthRepository.createUser(registerData.apple);
    await testGroupsRepository.createGroup({ user_id: 'US111111111111', group_title: 'group1' });
  });

  describe('create category', () => {
    it('success', async () => {
      const categoryInfo = <CategoryInfo>await testCategoriesRepository.createCategory({
        user_id: 'US111111111111',
        group_id: 'GR333333333333',
        category_title: 'category1',
      });

      expect(categoryInfo.category_id).toBe('CT555555555555');
      expect(categoryInfo.user_id).toBe('US111111111111');
      expect(categoryInfo.group_id).toBe('GR333333333333');
      expect(categoryInfo.category_title).toBe('category1');
      expect(categoryInfo.task_ids).toBeNull();
    });
  });

  describe('find category by group id and category title', () => {
    it('category', async () => {
      const category = <Category>(
        await testCategoriesRepository.findCategoryByGroupIdAndCategoryTitle('GR333333333333', 'category1')
      );

      expect(category.category_id).toBe('CT555555555555');
      expect(category.user_id).toBe('US111111111111');
      expect(category.group_id).toBe('GR333333333333');
      expect(category.category_title).toBe('category1');
    });

    it('undefined', async () => {
      const category = <undefined>(
        await testCategoriesRepository.findCategoryByGroupIdAndCategoryTitle('GR333333333333', 'category2')
      );

      expect(category).toBeUndefined();
    });
  });

  describe('find category by category id', () => {
    it('category', async () => {
      const category = <Category>await testCategoriesRepository.findCategoryByCategoryId('CT555555555555');

      expect(category.category_id).toBe('CT555555555555');
      expect(category.user_id).toBe('US111111111111');
      expect(category.group_id).toBe('GR333333333333');
      expect(category.category_title).toBe('category1');
    });

    it('undefined', async () => {
      const category = <undefined>await testCategoriesRepository.findCategoryByCategoryId('CT666666666666');

      expect(category).toBeUndefined();
    });
  });

  describe('find categories by group_id', () => {
    it('category', async () => {
      const categoryList = <Category[]>await testCategoriesRepository.findCategoriesByGroupId('GR333333333333');

      categoryList.forEach(category => {
        expect(typeof category.category_id).toBe('string');
        expect(typeof category.user_id).toBe('string');
        expect(category.group_id).toBe('GR333333333333');
        expect(typeof category.category_title).toBe('string');
      });
    });

    it('undefined', async () => {
      const categoryList = <[]>await testCategoriesRepository.findCategoriesByGroupId('GR444444444444');

      expect(categoryList.length).toBe(0);
    });
  });

  describe('update category', () => {
    it('success', async () => {
      const categoryInfo = <CategoryInfo>await testCategoriesRepository.updateCategory({
        category_id: 'CT555555555555',
        category_title: 'update_category1',
      });

      expect(categoryInfo.category_id).toBe('CT555555555555');
      expect(categoryInfo.user_id).toBe('US111111111111');
      expect(categoryInfo.group_id).toBe('GR333333333333');
      expect(categoryInfo.category_title).toBe('update_category1');
      expect(categoryInfo.task_ids).toBeNull();
    });
  });

  describe('delete category', () => {
    it('success', async () => {
      await testCategoriesRepository.deleteCategory({
        category_id: 'CT555555555555',
      });
    });
  });

  afterAll(async () => {
    await testCategoriesRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
