import supertest from 'supertest';
import { errorMessage } from '../../src/utils/message.util';
import { loginData } from '../datas/auth/login.data';
import { registerData } from '../datas/auth/register.data';
import { updateUserData } from '../datas/users/updateUser.data';
import { TestGenerator } from '../repositories/base/generator';
import { server, testConatiner } from '../server';

const request = supertest(server.server);

const testUsersRepository = testConatiner.getUsersRepository();

let access_token: string;

describe('Users', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await request.post('/api/auth/register').send(registerData.kakao);
    const { body } = await request.post('/api/auth/login').send(loginData.kakao);

    access_token = body.data.access_token;
  });

  describe('get my user', () => {
    it('success', async () => {
      const { statusCode, body } = await request.get('/api/users/my').set('authorization', `Bearer ${access_token}`);

      expect(statusCode).toBe(200);
      expect(body.data.user.user_id).toBe('US1111111111111111');
      expect(body.data.user.social_type).toBe(registerData.kakao.social_type);
      expect(body.data.user.user_name).toBe(registerData.kakao.user_name);
      expect(body.data.user.profile_color).toBe(registerData.kakao.profile_color);
    });
  });

  describe('get user by user id', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .get('/api/users/US1111111111111111')
        .set('authorization', `Bearer ${access_token}`);

      expect(statusCode).toBe(200);
      expect(body.data.user.user_id).toBe('US1111111111111111');
      expect(body.data.user.social_type).toBe(registerData.kakao.social_type);
      expect(body.data.user.user_name).toBe(registerData.kakao.user_name);
      expect(body.data.user.profile_color).toBe(registerData.kakao.profile_color);
    });

    it('not found user', async () => {
      const { statusCode, body } = await request
        .get('/api/users/US2222222222')
        .set('authorization', `Bearer ${access_token}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });
  });

  describe('update user', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .put('/api/users/US1111111111111111')
        .set('authorization', `Bearer ${access_token}`)
        .send(updateUserData.success);

      expect(statusCode).toBe(200);
      expect(body.data.user.user_id).toBe('US1111111111111111');
      expect(body.data.user.social_type).toBe(registerData.kakao.social_type);
      expect(body.data.user.user_name).toBe(updateUserData.success.user_name);
      expect(body.data.user.profile_color).toBe(registerData.kakao.profile_color);
    });
  });

  afterAll(async () => {
    await testUsersRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
