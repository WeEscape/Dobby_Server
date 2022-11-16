import supertest from 'supertest';
import { errorMessage } from '../../src/utils/message.util';
import { loginData } from '../datas/auth/login.data';
import { registerData } from '../datas/auth/register.data';
import { TestGenerator } from '../repositories/base/generator';
import { server, testConatiner } from '../server';
import { sleep } from '../utils/sleep';

const request = supertest(server.server);

const testAuthRepository = testConatiner.getAuthRepository();

let access_token: string;
let refresh_token: string;

describe('Auth', () => {
  beforeAll(() => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
  });

  describe('register', () => {
    it('kakao', async () => {
      const { statusCode, body } = await request.post('/api/auth/register').send(registerData.kakao);

      expect(statusCode).toBe(200);
      expect(body.data.user.social_type).toBe(registerData.kakao.social_type);
      expect(body.data.user.user_name).toBe(registerData.kakao.user_name);
      expect(body.data.user.profile_color).toBe(registerData.kakao.profile_color);
    });

    it('apple', async () => {
      const { statusCode, body } = await request.post('/api/auth/register').send(registerData.apple);

      expect(statusCode).toBe(200);
      expect(body.data.user.social_type).toBe(registerData.apple.social_type);
      expect(body.data.user.user_name).toBe(registerData.apple.user_name);
      expect(body.data.user.profile_color).toBe(registerData.apple.profile_color);
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .post('/api/auth/register')
        .send({ ...registerData.kakao, social_type: 'github' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('social_type'));
    });

    it('duplicate social id or social type error', async () => {
      const { statusCode, body } = await request
        .post('/api/auth/register')
        .send(registerData.duplicateSocialIdAndSocialType);

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.existUser);
    });
  });

  describe('login', () => {
    it('success', async () => {
      const { statusCode, body } = await request.post('/api/auth/login').send(loginData.kakao);

      expect(statusCode).toBe(200);
      expect(typeof body.data.access_token).toBe('string');
      expect(typeof body.data.refresh_token).toBe('string');

      access_token = body.data.access_token;
      refresh_token = body.data.refresh_token;
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .post('/api/auth/login')
        .send({ ...loginData.kakao, social_type: 'github' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('social_type'));
    });

    it('invalid social id or social type', async () => {
      const { statusCode, body } = await request.post('/api/auth/login').send(loginData.invalidSocialIdOrSocialType);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFoundUser);
    });
  });

  describe('logout', () => {
    it('success', async () => {
      const { statusCode } = await request.post('/api/auth/logout').set('authorization', `Bearer ${access_token}`);

      expect(statusCode).toBe(200);
    });
  });

  describe('get tokens', () => {
    it('success', async () => {
      const { statusCode, body } = await request.post('/api/auth/tokens').send({ refresh_token });

      expect(statusCode).toBe(200);
      expect(typeof body.data.access_token).toBe('string');
      expect(typeof body.data.refresh_token).toBe('string');

      refresh_token = body.data.refresh_token;
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request.post('/api/auth/tokens').send({ refresh_token: 123 });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('refresh_token'));
    });

    it('invalid refresh token', async () => {
      const { statusCode, body } = await request.post('/api/auth/tokens').send({ refresh_token: 'refresh_token' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('refresh_token'));
    });

    it('invalid ip', async () => {
      const { statusCode, body } = await request
        .post('/api/auth/tokens')
        .set('X-Forwarded-For', '127.0.0.2')
        .send({ refresh_token });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('refresh_token'));
    });

    it('expired refresh token', async () => {
      await sleep(1);

      const { statusCode, body } = await request.post('/api/auth/tokens').send({ refresh_token });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.expiredRefreshToken);
    });
  });

  describe('withdraw', () => {
    it('success', async () => {
      const { statusCode } = await request.post('/api/auth/withdraw').set('authorization', `Bearer ${access_token}`);

      expect(statusCode).toBe(200);
    });
  });

  afterAll(async () => {
    await testAuthRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
    ]);
  });
});
