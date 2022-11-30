import { User } from '../../src/entities/user.entity';
import { SocialService } from '../../src/services/social.service';

export class TestSocialService extends SocialService {
  /** To Do: 애플 refresh token 획득 */
  async getAppleRefreshToken(authorization_code: string): Promise<string> {
    return 'apple refresh token';
  }

  /** social 탈퇴 */
  async withdrawFromSocial(user: User): Promise<void> {}
}
