import axios from 'axios';
import { config } from '../config';
import { User } from '../entities/user.entity';
import { BadGatewayError } from '../exceptions/BadGateway.exception';
import { logger } from '../utils/logger.util';

export class SocialService {
  private async withdrawFromKakao(social_id: string): Promise<void> {
    try {
      await axios.post(
        'https://kapi.kakao.com/v1/user/unlink',
        { target_id_type: 'user_id', target_id: social_id },
        {
          headers: {
            Authorization: `KakaoAK ${config.social.kakao.admin}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (err) {
      logger.error(`KAKAO: ${err}`);
      throw new BadGatewayError('kakao');
    }
  }

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
        await this.withdrawFromKakao(<string>user.social_id);
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
