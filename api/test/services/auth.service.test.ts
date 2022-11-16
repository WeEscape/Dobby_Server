import { errorMessage } from '../../src/utils/message.util';
import { loginData } from '../datas/auth/login.data';
import { registerData } from '../datas/auth/register.data';
import { TestGenerator } from '../repositories/base/generator';
import { testConatiner } from '../server';
import { sleep } from '../utils/sleep';

const testAuthRepository = testConatiner.getAuthRepository();
const testAuthService = testConatiner.getAuthService();

let refresh_token: string;

describe('Auth Service', () => {
  beforeAll(() => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
  });

  describe('register', () => {
    it('kakao', async () => {
      const result = await testAuthService.register(registerData.kakao);

      expect(result.user.user_id).toBe('US111111111111');
      expect(result.user.social_type).toBe(registerData.kakao.social_type);
      expect(result.user.user_name).toBe(registerData.kakao.user_name);
      expect(result.user.profile_color).toBe(registerData.kakao.profile_color);
    });

    it('apple', async () => {
      const result = await testAuthService.register(registerData.apple);

      expect(result.user.user_id).toBe('US222222222222');
      expect(result.user.social_type).toBe(registerData.apple.social_type);
      expect(result.user.user_name).toBe(registerData.apple.user_name);
      expect(result.user.profile_color).toBe(registerData.apple.profile_color);
    });

    it('duplicate social id and social type', async () => {
      await expect(
        async () => await testAuthService.register(registerData.duplicateSocialIdAndSocialType),
      ).rejects.toThrowError(errorMessage.existUser);
    });
  });

  describe('login', () => {
    it('success', async () => {
      const result = await testAuthService.login(loginData.success, '127.0.0.1');

      expect(typeof result.access_token).toBe('string');
      expect(typeof result.refresh_token).toBe('string');

      refresh_token = result.refresh_token;
    });

    it('invalid social id or social type', async () => {
      await expect(
        async () =>
          await testAuthService.login(
            {
              social_id: loginData.invalidSocialIdOrSocialType.social_id,
              social_type: loginData.invalidSocialIdOrSocialType.social_type,
            },
            '127.0.0.1',
          ),
      ).rejects.toThrowError(errorMessage.notFoundUser);
    });
  });

  describe('logout', () => {
    it('success', async () => {
      await testAuthService.logout('US111111111111');
    });
  });

  describe('get tokens', () => {
    it('success', async () => {
      const result = await testAuthService.getTokens(refresh_token, '127.0.0.1');

      expect(typeof result.access_token).toBe('string');
      expect(typeof result.refresh_token).toBe('string');
    });

    it('invalid refresh token', async () => {
      await expect(async () => await testAuthService.getTokens('refresh_token', '127.0.0.1')).rejects.toThrowError(
        errorMessage.invalidParameter('refresh_token'),
      );
    });

    it('invalid ip', async () => {
      await expect(async () => await testAuthService.getTokens(refresh_token, '127.0.0.2')).rejects.toThrowError(
        errorMessage.invalidParameter('refresh_token'),
      );
    });

    it('expired refresh token', async () => {
      await sleep(1);
      await expect(async () => await testAuthService.getTokens(refresh_token, '127.0.0.1')).rejects.toThrowError(
        errorMessage.expiredRefreshToken,
      );
    });
  });

  describe('withdraw', () => {
    it('success', async () => {
      await testAuthService.withdraw('US111111111111');
    });
  });

  afterAll(async () => {
    await testAuthRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
    ]);
  });
});
