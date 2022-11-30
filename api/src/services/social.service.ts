import axios from 'axios';
import jwt from 'jsonwebtoken';
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

  private async createAppleClientSecret(): Promise<string> {
    return jwt.sign({}, <string>config.social.apple.privateKey, <Object>config.social.apple.clientClient);
  }

  private async withdrawFromApple(refresh_token: string): Promise<void> {
    try {
      axios.post(
        'https://appleid.apple.com/auth/revoke',
        {
          client_id: config.social.apple.clientId,
          client_secret: this.createAppleClientSecret(),
          token: refresh_token,
          token_type_hint: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (err) {
      logger.error(`APPLE: ${err}`);
      throw new BadGatewayError('apple');
    }
  }

  async getAppleRefreshToken(authorization_code: string): Promise<string> {
    try {
      const { data } = await axios.post(
        'https://appleid.apple.com/auth/token',
        {
          client_id: config.social.apple.clientId,
          client_secret: this.createAppleClientSecret(),
          code: authorization_code,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return data.refresh_token;
    } catch (err) {
      logger.error(`APPLE: ${err}`);
      throw new BadGatewayError('apple');
    }
  }

  /** social 탈퇴 */
  async withdrawFromSocial(user: User): Promise<void> {
    switch (user.social_type) {
      case 'kakao':
        await this.withdrawFromKakao(<string>user.social_id);
        break;
      case 'apple':
        await this.withdrawFromApple(<string>user.apple_refresh_token);
        break;
      default:
    }
  }
}
