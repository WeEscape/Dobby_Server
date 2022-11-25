import { testConatiner } from '../server';
import { registerData } from '../datas/auth/register.data';
import { TestGenerator } from './base/generator';
import { User } from '../../src/entities/user.entity';
import { defaultValue } from '../../src/utils/default.util';

const testAuthRepository = testConatiner.getAuthRepository();

describe('Auth Repository', () => {
  beforeAll(() => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
  });

  describe('create user', () => {
    it('success', async () => {
      const user = await testAuthRepository.createUser(registerData.kakao);

      expect(user.user_id).toBe('US1111111111111111');
      expect(user.user_name).toBe(registerData.kakao.user_name);
      expect(user.profile_image_url).toBe(defaultValue.profileImage);
      expect(user.profile_color).toBe(registerData.kakao.profile_color);
    });
  });

  describe('find by user id', () => {
    it('user', async () => {
      const user = <User>await testAuthRepository.findByUserId('US1111111111111111');

      expect(user).toBeDefined();
    });
  });

  describe('find by social id and social type', () => {
    it('user', async () => {
      const user = <User>(
        await testAuthRepository.findBySocialIdAndSocialType(
          registerData.kakao.social_id,
          registerData.kakao.social_type,
        )
      );

      expect(user).toBeDefined();
    });
  });

  describe('connect user', () => {
    it('success', async () => {
      await testAuthRepository.connectUser({
        user_id: 'US1111111111111111',
      });

      const user = <User>(
        await testAuthRepository.findBySocialIdAndSocialType(
          registerData.kakao.social_id,
          registerData.kakao.social_type,
        )
      );

      expect(user.is_connect).toBe(1);
    });
  });

  describe('disconnect user', () => {
    it('success', async () => {
      await testAuthRepository.disconnectUser({ user_id: 'US1111111111111111' });

      const user = <User>(
        await testAuthRepository.findBySocialIdAndSocialType(
          registerData.kakao.social_id,
          registerData.kakao.social_type,
        )
      );

      expect(user.is_connect).toBe(0);
      expect(user.last_connected_at).toBeDefined();
    });
  });

  describe('upsert refresh ', () => {
    it('success', async () => {
      await testAuthRepository.upsertRefreshToken({
        user_id: 'US1111111111111111',
        ip: '127.0.0.1',
        token: 'refresh_token',
      });
    });
  });

  describe('find user by refresh token', () => {
    it('user', async () => {
      const user = <User>await testAuthRepository.findUserByRefreshToken('refresh_token', '127.0.0.1');

      expect(user.user_id).toBe('US1111111111111111');
    });

    it('undefined', async () => {
      const user = <undefined>await testAuthRepository.findUserByRefreshToken('refresh_token', '127.0.0.2');

      expect(user).toBeUndefined();
    });
  });

  describe('delete user', () => {
    it('success', async () => {
      await testAuthRepository.deleteUser({ user_id: 'US1111111111111111' });

      const user = <User>await testAuthRepository.findByUserId('US1111111111111111');

      expect(user.social_id).toBeNull();
      expect(user.deleted_at).toBeDefined();
    });
  });

  afterAll(async () => {
    await testAuthRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
