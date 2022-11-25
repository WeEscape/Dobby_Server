import { Group } from '../../src/entities/group.entity';
import { User } from '../../src/entities/user.entity';
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

  describe('find user by user id', () => {
    it('user', async () => {
      const [user, groupList] = <[User, Group[]]>await testUsersRepository.findUserInfoByUserId('US1111111111111111');

      expect(user.user_id).toBe('US1111111111111111');
      expect(user.social_type).toBe(registerData.kakao.social_type);
      expect(user.user_name).toBe(registerData.kakao.user_name);
      expect(user.profile_color).toBe(registerData.kakao.profile_color);
      groupList.forEach(group => {
        expect(typeof group.group_id).toBe('string');
      });
    });

    it('undefined', async () => {
      const [user, groupList] = <[undefined, []]>await testUsersRepository.findUserInfoByUserId('US1010101010101010');

      expect(user).toBeUndefined();
      expect(groupList).toEqual([]);
    });
  });

  describe('update user', () => {
    it('success', async () => {
      const [user] = <[User, Group[]]>(
        await testUsersRepository.updateUser({ user_id: 'US1111111111111111', ...updateUserData.success })
      );

      expect(user.user_name).toBe(updateUserData.success.user_name);
    });
  });

  afterAll(async () => {
    await testUsersRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
