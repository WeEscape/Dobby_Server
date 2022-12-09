import supertest from 'supertest';
import { User } from '../../src/entities/user.entity';
import { errorMessage } from '../../src/utils/message.util';
import { loginData } from '../datas/auth/login.data';
import { registerData } from '../datas/auth/register.data';
import { TestGenerator } from '../repositories/base/generator';
import { server, testConatiner } from '../server';

const request = supertest(server.server);

const testGroupsRepository = testConatiner.getGroupsRepository();

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
  });

  describe('create group', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .post('/api/groups')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ group_title: 'group1' });

      expect(statusCode).toBe(200);
      expect(body.data.group.group_id).toBe('GR2020202020202020');
      expect(body.data.group.user_id).toBe('US1111111111111111');
      expect(body.data.group.group_title).toBe('group1');
      expect(body.data.group.invite_code.length).toBe(6);
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .post('/api/groups')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ group_title: 123 });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('group_title'));
    });

    it('duplicate group title', async () => {
      const { statusCode, body } = await request
        .post('/api/groups')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ group_title: 'group1' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.duplicate);
    });
  });

  describe('get group', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .get('/api/groups/GR2020202020202020')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);
      expect(body.data.group.group_id).toBe('GR2020202020202020');
      expect(body.data.group.user_id).toBe('US1111111111111111');
      expect(body.data.group.group_title).toBe('group1');
      expect(body.data.group.invite_code.length).toBe(6);
    });

    it('not found group', async () => {
      const { statusCode, body } = await request
        .get('/api/groups/GR4444444444444444')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .get('/api/groups/GR2020202020202020')
        .set('authorization', `Bearer ${access_token2}`);

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });
  });

  describe('update group', () => {
    it('success', async () => {
      const { statusCode, body } = await request
        .put('/api/groups/GR2020202020202020')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ group_title: 'update_group1' });

      expect(statusCode).toBe(200);
      expect(body.data.group.group_id).toBe('GR2020202020202020');
      expect(body.data.group.user_id).toBe('US1111111111111111');
      expect(body.data.group.group_title).toBe('update_group1');
      expect(body.data.group.invite_code.length).toBe(6);
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .put('/api/groups/GR2020202020202020')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ group_title: 123 });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('group_title'));
    });

    it('not found group', async () => {
      const { statusCode, body } = await request
        .put('/api/groups/GR4444444444444444')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ group_title: 'update_group1' });

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .put('/api/groups/GR2020202020202020')
        .set('authorization', `Bearer ${access_token2}`)
        .send({ group_title: 'update_group1' });

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });

    it('duplicate group title', async () => {
      await request.post('/api/groups').set('authorization', `Bearer ${access_token1}`).send({ group_title: 'group2' });

      const { statusCode, body } = await request
        .put('/api/groups/GR2020202020202020')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ group_title: 'group2' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.duplicate);
    });
  });

  describe('join group', () => {
    it('invalid invite code', async () => {
      const { statusCode, body } = await request
        .post('/api/groups/user')
        .set('authorization', `Bearer ${access_token2}`)
        .send({ invite_code: '000000' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('invite_code'));
    });

    it('success', async () => {
      const { statusCode, body } = await request
        .post('/api/groups/user')
        .set('authorization', `Bearer ${access_token2}`)
        .send({ invite_code: '212121' });

      expect(statusCode).toBe(200);
      expect(body.data.group.group_id).toBe('GR2020202020202020');
      expect(body.data.group_user_list.some((user: User) => user.user_id === 'US1010101010101010')).toBeTruthy();
    });

    it('parameter error', async () => {
      const { statusCode, body } = await request
        .post('/api/groups/user')
        .set('authorization', `Bearer ${access_token2}`)
        .send({ invite_code: 123 });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.invalidParameter('invite_code'));
    });

    it('group user', async () => {
      const { statusCode, body } = await request
        .post('/api/groups/user')
        .set('authorization', `Bearer ${access_token1}`)
        .send({ invite_code: '212121' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe(errorMessage.duplicate);
    });
  });

  describe('leave group', () => {
    it('success', async () => {
      const { statusCode } = await request
        .delete('/api/groups/GR2020202020202020/user')
        .set('authorization', `Bearer ${access_token2}`);

      expect(statusCode).toBe(200);
    });

    it('not group user', async () => {
      const { statusCode, body } = await request
        .delete('/api/groups/GR2020202020202020/user')
        .set('authorization', `Bearer ${access_token2}`)
        .send({ invite_code: '444444' });

      expect(statusCode).toBe(403);
      expect(body.message).toBe(errorMessage.forbidden);
    });

    it('not found group', async () => {
      const { statusCode, body } = await request
        .delete('/api/groups/GR4444444444444444/user')
        .set('authorization', `Bearer ${access_token2}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe(errorMessage.notFound);
    });

    it('delete group', async () => {
      const { statusCode } = await request
        .delete('/api/groups/GR2020202020202020/user')
        .set('authorization', `Bearer ${access_token1}`);

      expect(statusCode).toBe(200);

      const group = <undefined>await testGroupsRepository.findGroupInfoByGroupId('GR2020202020202020');

      expect(group).toBeUndefined();
    });
  });

  afterAll(async () => {
    await testGroupsRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
