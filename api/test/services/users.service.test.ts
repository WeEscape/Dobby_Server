import { errorMessage } from '../../src/utils/message.util';
import { loginData } from '../datas/auth/login.data';
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

  describe('get user info', () => {
    it('success', async () => {
      const result = await testUsersService.getUserInfo('US111111111111');

      expect(result.user_info.user_id).toBe('US111111111111');
      expect(result.user_info.social_type).toBe(registerData.kakao.social_type);
      expect(result.user_info.user_name).toBe(registerData.kakao.user_name);
      expect(result.user_info.profile_image_url).toBeNull();
      expect(result.user_info.profile_color).toBe(registerData.kakao.profile_color);
      expect(result.user_info.group_ids).toBeNull();
    });

    it('not found user', async () => {
      await expect(async () => await testUsersService.getUserInfo('US222222222222')).rejects.toThrowError(
        errorMessage.notFound,
      );
    });
  });

  describe('update user', () => {
    it('success', async () => {
      const result = await testUsersService.updateUser('US111111111111', updateUserData.success);

      expect(result.user_info.user_id).toBe('US111111111111');
      expect(result.user_info.social_type).toBe(registerData.kakao.social_type);
      expect(result.user_info.user_name).toBe(updateUserData.success.user_name);
      expect(result.user_info.profile_image_url).toBeNull();
      expect(result.user_info.profile_color).toBe(registerData.kakao.profile_color);
      expect(result.user_info.group_ids).toBeNull();
    });
  });

  afterAll(async () => {
    await testUsersRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
    ]);
  });
});
