import { LoginDto } from '../dtos/auth/login.dto';
import { RegisterDto } from '../dtos/auth/register.dto';
import { User } from '../entities/user.entity';
import { BadRequestError } from '../exceptions/BadRequest.exception';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { AuthRepository } from '../repositories/auth.repository';
import { errorMessage } from '../utils/message.util';
import { generateAccessToken, generateRefreshToken } from '../utils/token.util';
import { SocialService } from './social.service';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository, private readonly socialService: SocialService) {}

  /** 회원가입 */
  async register(registerDto: RegisterDto): Promise<{ user: User }> {
    const existUser = await this.authRepository.findBySocialIdAndSocialType(
      registerDto.social_id,
      registerDto.social_type,
      { select: ['USERS.user_id'] },
    );
    if (existUser) {
      throw new BadRequestError(errorMessage.duplicate);
    }

    let user: User;

    if (registerDto.social_type === 'apple') {
      const apple_refresh_token = await this.socialService.getAppleRefreshToken(<string>registerDto.authorize_code);

      user = await this.authRepository.createUser({ ...registerDto, apple_refresh_token });
    } else {
      user = await this.authRepository.createUser(registerDto);
    }

    return { user };
  }

  /** 로그인 */
  async login(loginDto: LoginDto, ip: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.authRepository.findBySocialIdAndSocialType(loginDto.social_id, loginDto.social_type, {
      select: ['USERS.user_id'],
    });
    if (!user) {
      throw new NotFoundError(errorMessage.notFound);
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken();

    await this.authRepository.connectUser({ user_id: user.user_id });
    await this.authRepository.upsertRefreshToken({ user_id: user.user_id, ip, token: refresh_token });

    return { access_token, refresh_token };
  }

  /** 로그아웃 */
  async logout(user_id: string): Promise<void> {
    await this.authRepository.disconnectUser({ user_id });
  }

  /** 회원탈퇴 */
  async withdraw(user_id: string): Promise<void> {
    const user = <User>await this.authRepository.findByUserId(user_id, {
      select: ['USERS.social_id', 'USERS.social_type', 'USERS.apple_refresh_token'],
    });

    await this.socialService.withdrawFromSocial(user);
    await this.authRepository.deleteUser({ user_id });
  }

  /** tokens 재발급 */
  async getTokens(token: string, ip: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.authRepository.findUserByRefreshToken(token, ip, {
      select: ['USERS.user_id', 'USERS_REFRESH_TOKENS.expired_at'],
    });
    if (!user) {
      throw new BadRequestError(errorMessage.invalidParameter('refresh_token'));
    }
    if (user.expired_at < new Date()) {
      throw new BadRequestError(errorMessage.expiredRefreshToken);
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken();

    await this.authRepository.upsertRefreshToken({ user_id: user.user_id, ip, token: refresh_token });

    return { access_token, refresh_token };
  }
}
