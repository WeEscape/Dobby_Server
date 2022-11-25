import { Category } from '../../src/entities/category.entity';
import { Task } from '../../src/entities/task.entity';
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
    await testGroupsRepository.createGroup({ user_id: 'US1111111111111111', group_title: 'group1' });
  });

  describe('create category', () => {
    it('success', async () => {
      const category = <Category>await testCategoriesRepository.createCategory({
        user_id: 'US1111111111111111',
        group_id: 'GR2020202020202020',
        category_title: 'category1',
      });

      expect(category.category_id).toBe('CT2929292929292929');
      expect(category.user_id).toBe('US1111111111111111');
      expect(category.group_id).toBe('GR2020202020202020');
      expect(category.category_title).toBe('category1');
    });
  });

  describe('find category by group id and category title', () => {
    it('category', async () => {
      const category = <Category>(
        await testCategoriesRepository.findCategoryByGroupIdAndCategoryTitle('GR2020202020202020', 'category1')
      );

      expect(category.category_id).toBe('CT2929292929292929');
      expect(category.user_id).toBe('US1111111111111111');
      expect(category.group_id).toBe('GR2020202020202020');
      expect(category.category_title).toBe('category1');
    });

    it('undefined', async () => {
      const category = <undefined>(
        await testCategoriesRepository.findCategoryByGroupIdAndCategoryTitle('GR2020202020202020', 'category2')
      );

      expect(category).toBeUndefined();
    });
  });

  describe('find category by category id', () => {
    it('category', async () => {
      const category = <Category>await testCategoriesRepository.findCategoryByCategoryId('CT2929292929292929');

      expect(category.category_id).toBe('CT2929292929292929');
      expect(category.user_id).toBe('US1111111111111111');
      expect(category.group_id).toBe('GR2020202020202020');
      expect(category.category_title).toBe('category1');
    });

    it('undefined', async () => {
      const category = <undefined>await testCategoriesRepository.findCategoryByCategoryId('CT1111111111111111');

      expect(category).toBeUndefined();
    });
  });

  describe('find category by category id', () => {
    it('task list', async () => {
      const taskList = <Task[]>await testCategoriesRepository.findTasksByCategoryId('CT2929292929292929');

      taskList.forEach(task => {
        expect(task.category_id).toBe('CT2929292929292929');
      });
    });
  });

  describe('find categories by group_id', () => {
    it('category', async () => {
      const categoryList = <Category[]>await testCategoriesRepository.findCategoriesByGroupId('GR2020202020202020');

      categoryList.forEach(category => {
        expect(typeof category.category_id).toBe('string');
        expect(typeof category.user_id).toBe('string');
        expect(category.group_id).toBe('GR2020202020202020');
        expect(typeof category.category_title).toBe('string');
      });
    });

    it('no data', async () => {
      const categoryList = <[]>await testCategoriesRepository.findCategoriesByGroupId('GR4444444444444444');

      expect(categoryList).toEqual([]);
    });
  });

  describe('update category', () => {
    it('success', async () => {
      const category = <Category>await testCategoriesRepository.updateCategory({
        category_id: 'CT2929292929292929',
        category_title: 'update_category1',
      });

      expect(category.category_id).toBe('CT2929292929292929');
      expect(category.user_id).toBe('US1111111111111111');
      expect(category.group_id).toBe('GR2020202020202020');
      expect(category.category_title).toBe('update_category1');
    });
  });

  describe('delete category', () => {
    it('success', async () => {
      await testCategoriesRepository.deleteCategory({
        category_id: 'CT2929292929292929',
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
