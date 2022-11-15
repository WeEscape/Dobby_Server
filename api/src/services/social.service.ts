import { User } from '../entities/user.entity';

export class SocialService {
  private async withdrawFromKakao(): Promise<void> {}

  private async withdrawFromGoogle(): Promise<void> {}

  private async withdrawFromApple(): Promise<void> {}

  /** To Do: 애플 refresh token 획득 */
  async getAppleRefreshToken(): Promise<string> {
    return 'apple refresh token';
  }

  /** social 탈퇴 */
  async withdrawFromSocial(user: User): Promise<void> {
    switch (user.social_type) {
      case 'kakao':
        await this.withdrawFromKakao();
        break;
      case 'google':
        await this.withdrawFromGoogle();
        break;
      case 'apple':
        await this.withdrawFromApple();
        break;
      default:
    }
  }
}
