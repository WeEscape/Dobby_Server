import { User } from '../../src/entities/user.entity';
import { UserInfo } from '../../src/interfaces/userInfo.interface';
import { registerData } from '../datas/auth/register.data';
import { updateUserData } from '../datas/users/updateUser.data';
import { testConatiner } from '../server';
import { TestGenerator } from './base/generator';

const testAuthRepository = testConatiner.getAuthRepository();
const testUsersRepository = testConatiner.getUsersRepository();

describe('Users Repository', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthRepository.createUser(registerData.kakao);
  });

  describe('find user info by user id', () => {
    it('user', async () => {
      const user = <UserInfo>await testUsersRepository.findUserInfoByUserId('US111111111111');

      expect(user.user_id).toBe('US111111111111');
      expect(user.social_type).toBe(registerData.kakao.social_type);
      expect(user.user_name).toBe(registerData.kakao.user_name);
      expect(user.profile_color).toBe(registerData.kakao.profile_color);
    });

    it('undefined', async () => {
      const user = <undefined>await testUsersRepository.findUserInfoByUserId('US222222222222');

      expect(user).toBeUndefined();
    });
  });

  describe('update user', () => {
    it('success', async () => {
      const user = <UserInfo>(
        await testUsersRepository.updateUser({ user_id: 'US111111111111', ...updateUserData.success })
      );

      expect(user.user_name).toBe(updateUserData.success.user_name);
    });
  });

  afterAll(async () => {
    await testUsersRepository.sendQuerys([{ query: `DELETE FROM USERS;` }]);
  });
});
