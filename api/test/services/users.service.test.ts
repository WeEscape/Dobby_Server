import { defaultValue } from '../../src/utils/default.util';
import { errorMessage } from '../../src/utils/message.util';
import { registerData } from '../datas/auth/register.data';
import { updateUserData } from '../datas/users/updateUser.data';
import { TestGenerator } from '../repositories/base/generator';
import { testConatiner } from '../server';

const testUsersRepository = testConatiner.getUsersRepository();
const testAuthService = testConatiner.getAuthService();
const testUsersService = testConatiner.getUsersService();

describe('Users Service', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthService.register(registerData.kakao);
  });

  describe('get user', () => {
    it('success', async () => {
      const result = await testUsersService.getUserInfo('US1111111111111111');

      expect(result.user.user_id).toBe('US1111111111111111');
      expect(result.user.social_type).toBe(registerData.kakao.social_type);
      expect(result.user.user_name).toBe(registerData.kakao.user_name);
      expect(result.user.profile_image_url).toBe(defaultValue.profileImage);
      expect(result.user.profile_color).toBe(registerData.kakao.profile_color);
      result.group_list.forEach(group => {
        expect(typeof group.group_id).toBe('string');
      });
    });

    it('not found user', async () => {
      await expect(async () => await testUsersService.getUserInfo('US1010101010101010')).rejects.toThrowError(
        errorMessage.notFound,
      );
    });
  });

  describe('update user', () => {
    it('success', async () => {
      const result = await testUsersService.updateUser('US1111111111111111', updateUserData.success);

      expect(result.user.user_id).toBe('US1111111111111111');
      expect(result.user.social_type).toBe(registerData.kakao.social_type);
      expect(result.user.user_name).toBe(updateUserData.success.user_name);
      expect(result.user.profile_image_url).toBe(defaultValue.profileImage);
      expect(result.user.profile_color).toBe(registerData.kakao.profile_color);
      result.group_list.forEach(group => {
        expect(typeof group.group_id).toBe('string');
      });
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
