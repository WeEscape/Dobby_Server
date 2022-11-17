import supertest from 'supertest';
import { CategoryInfo } from '../../src/interfaces/categoryInfo.interface';
import { errorMessage } from '../../src/utils/message.util';
import { loginData } from '../datas/auth/login.data';
import { registerData } from '../datas/auth/register.data';
import { createCategoryData } from '../datas/categories/createCategory.data';
import { TestGenerator } from '../repositories/base/generator';
import { server, testConatiner } from '../server';

const request = supertest(server.server);

const testCategoriesRepository = testConatiner.getCategoriesRepository();

let access_token1: string;
let access_token2: string;

describe('Groups', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await request.post('/api/auth/register').send(registerData.kakao);
    const result1 = await request.post('/api/auth/login').send(loginData.kakao);

    access_token1 = result1.body.data.access_token;

    await request.post('/api/auth/register').send(registerData.apple);
    const result2 = await request.post('/api/auth/login').send(loginData.apple);

    access_token2 = result2.body.data.access_token;

    await request.post('/api/groups/').set('authorization', `Bearer ${access_token1}`).send({ group_title: 'group1' });
  });

  describe('create category', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .post('/api/categories')
        .set('authorization', `Bearer ${access_token1}`)
        .send(createCategoryData.success);

      expect(statusCode).toBe(200);
      expect(body.data.category_info.category_id).toBe('CT555555555555');
      expect(body.data.category_info.user_id).toBe('US111111111111');
      expect(body.data.category_info.group_id).toBe(createCategoryData.success.group_id);
      expect(body.data.category_info.category_title).toBe(createCategoryData.success.category_title);
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .post('/api/categories')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ ...createCategoryData.success, category_title: 123 });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('category_title'));
    });

    it('not found group', async () => {
      const { statusCode, body } = await request
        .post('/api/categories')
        .set('authorization', `Bearer ${access_token1}`)
        .send(createCategoryData.notfoundGroup);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('duplicate category title', async () => {
      const { statusCode, body } = await request
        .post('/api/categories')
        .set('authorization', `Bearer ${access_token1}`)
        .send(createCategoryData.duplicateCategoryTitle);

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.duplicate);
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .post('/api/categories')
        .set('authorization', `Bearer ${access_token2}`)
        .send(createCategoryData.success);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('get categories', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .get('/api/categories/group/GR333333333333')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);
      body.data.category_list.forEach((category: CategoryInfo) => {
        expect(typeof category.category_id).toBe('string');
        expect(typeof category.user_id).toBe('string');
        expect(category.group_id).toBe('GR333333333333');
        expect(typeof category.category_title).toBe('string');
      });
    });

    it('not found group', async () => {
      const { statusCode, body } = await request
        .get('/api/categories/group/GR444444444444')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .get('/api/categories/group/GR333333333333')
        .set('authorization', `Bearer ${access_token2}`);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('get category', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .get('/api/categories/CT555555555555')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);
      expect(body.data.category_info.category_id).toBe('CT555555555555');
      expect(body.data.category_info.user_id).toBe('US111111111111');
      expect(body.data.category_info.group_id).toBe(createCategoryData.success.group_id);
      expect(body.data.category_info.category_title).toBe(createCategoryData.success.category_title);
    });

    it('not found category', async () => {
      const { statusCode, body } = await request
        .get('/api/categories/CT444444444444')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not found category', async () => {
      const { statusCode, body } = await request
        .get('/api/categories/CT555555555555')
        .set('authorization', `Bearer ${access_token2}`);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('update category', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .put('/api/categories/CT555555555555')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ category_title: 'update_category1' });

      expect(statusCode).toBe(200);
      expect(body.data.category_info.category_id).toBe('CT555555555555');
      expect(body.data.category_info.user_id).toBe('US111111111111');
      expect(body.data.category_info.group_id).toBe(createCategoryData.success.group_id);
      expect(body.data.category_info.category_title).toBe('update_category1');
    });

    it('not found category', async () => {
      const { statusCode, body } = await request
        .put('/api/categories/CT444444444444')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ category_title: 'update_category1' });

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('duplicate category title', async () => {
      await request
        .post('/api/categories')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ ...createCategoryData.success, category_title: 'category2' });

      const { statusCode, body } = await request
        .put('/api/categories/CT555555555555')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ category_title: 'category2' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.duplicate);
    });

    it('not found category', async () => {
      const { statusCode, body } = await request
        .put('/api/categories/CT555555555555')
        .set('authorization', `Bearer ${access_token2}`)
        .send({ category_title: 'update_category1' });

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('delete category', () => {
    it('success', async () => {
      const { statusCode } = await request
        .delete('/api/categories/CT555555555555')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);

      const categoryInfo = <undefined>await testCategoriesRepository.findCategoryByCategoryId('CT555555555555');

      expect(categoryInfo).toBeUndefined();
    });

    it('not found category', async () => {
      const { statusCode, body } = await request
        .delete('/api/categories/CT444444444444')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .delete('/api/categories/CT666666666666')
        .set('authorization', `Bearer ${access_token2}`);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
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
