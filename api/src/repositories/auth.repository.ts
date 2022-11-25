import { ProfileColor, SocialType, User } from '../entities/user.entity';
import { UserRefreshToken } from '../entities/userRefreshToken.entity';
import { defaultValue } from '../utils/default.util';
import { RdbmsRepository, SelectOptions } from './base/rdbms.repository';

export class AuthRepository extends RdbmsRepository {
  /** id별 회원 조회 */
  async findByUserId(user_id: string, options?: SelectOptions): Promise<User | undefined> {
    const selectField = options?.select.toString() || 'USERS.*';

    return (<User[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM USERS
          WHERE user_id = ?;
        `,
        params: [user_id],
      },
    ]))[0][0];
  }

  /** social id, social type별 회원 조회 */
  async findBySocialIdAndSocialType(
    social_id: string,
    social_type: SocialType,
    options?: SelectOptions,
  ): Promise<User | undefined> {
    const selectField = options?.select.toString() || 'USERS.*';

    return (<User[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM USERS
          WHERE social_id = ?
            AND social_type = ?;
        `,
        params: [social_id, social_type],
      },
    ]))[0][0];
  }

  /** 회원 생성 */
  async createUser(options: {
    social_id: string;
    social_type: SocialType;
    user_name: string;
    profile_image_url?: string;
    profile_color: ProfileColor;
    apple_refresh_token?: string;
  }): Promise<User> {
    const querys = [];

    const userId = 'US' + this.generateId();
    const groupId = 'GR' + this.generateId();
    const inviteCode = this.generator.generateRandomString(6);

    querys.push({
      query: `
          INSERT INTO USERS(
            user_id,
            social_id,
            social_type,
            user_name,
            profile_image_url,
            profile_color,
            apple_refresh_token
          ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          );
        `,
      params: [
        userId,
        options.social_id,
        options.social_type,
        options.user_name,
        options?.profile_image_url || defaultValue.profileImage,
        options.profile_color,
        options?.apple_refresh_token || null,
      ],
    });
    querys.push({
      query: `
          INSERT INTO GROUPS(
            group_id,
            user_id,
            group_title,
            invite_code
          ) VALUES (
            ?,
            ?,
            ?,
            ?
          );
        `,
      params: [groupId, userId, userId, inviteCode],
    });
    querys.push({
      query: `
          INSERT INTO GROUPS_USERS(
            group_id,
            user_id
          ) VALUES (
            ?,
            ?
          );
        `,
      params: [groupId, userId],
    });

    defaultValue.categoryTitles.forEach(title => {
      const categoryId = 'CT' + this.generateId();

      querys.push({
        query: `
            INSERT INTO CATEGORIES(
              category_id,
              user_id,
              group_id,
              category_title
            ) VALUES (
              ?,
              ?,
              ?,
              ?
            );
          `,
        params: [categoryId, userId, groupId, title],
      });
    });

    await this.sendQuerys(querys);

    return <User>await this.findBySocialIdAndSocialType(options.social_id, options.social_type, {
      select: [
        'USERS.user_id',
        'USERS.social_type',
        'USERS.user_name',
        'USERS.profile_image_url',
        'USERS.profile_color',
      ],
    });
  }

  /** 회원 접속 */
  async connectUser(options: { user_id: string }): Promise<void> {
    await this.sendQuerys([
      {
        query: `
          UPDATE USERS SET
            is_connect = 1
          WHERE user_id = ?;
        `,
        params: [options.user_id],
      },
    ]);
  }

  /** 회원 집속 해제 */
  async disconnectUser(options: { user_id: string }): Promise<void> {
    const now = new Date();

    await this.sendQuerys([
      {
        query: `
          UPDATE USERS SET
            is_connect = 0,
            last_connected_at = ?
          WHERE user_id = ?;
        `,
        params: [now, options.user_id],
      },
    ]);
  }

  /** 회원 탈퇴 */
  async deleteUser(options: { user_id: string }): Promise<void> {
    const now = new Date();

    await this.sendQuerys([
      {
        query: `
          UPDATE USERS SET
            social_id = NULL,
            social_type = NULL,
            user_name = NULL,
            profile_image_url = NULL,
            profile_color = NULL,
            is_connect = 0,
            last_connected_at = NULL,
            apple_refresh_token = NULL,
            deleted_at = ?
          WHERE user_id = ?;
        `,
        params: [now, options.user_id],
      },
      {
        query: `
          DELETE USERS_REFRESH_TOKENS, GROUPS_USERS, TASKS_USERS
          FROM USERS
          LEFT JOIN USERS_REFRESH_TOKENS USING(user_id)
          LEFT JOIN GROUPS_USERS USING(user_id)
          LEFT JOIN TASKS_USERS USING(user_id)
          WHERE user_id = ?;
        `,
        params: [options.user_id],
      },
      {
        query: `
          DELETE GROUPS, CATEGORIES, TASKS
          FROM GROUPS
          LEFT JOIN CATEGORIES USING(group_id)
          LEFT JOIN TASKS USING(category_id)
          LEFT JOIN GROUPS_USERS USING(group_id)
          WHERE GROUPS_USERS.user_id IS NULL;
        `,
      },
    ]);
  }

  /** refresh token 갱신 */
  async upsertRefreshToken(options: { user_id: string; ip: string; token: string }): Promise<void> {
    const expiredAt = this.generator.generateRefreshTokenExpiredAt();

    await this.sendQuerys([
      { query: 'SET @expired_at = ?;', params: [expiredAt] },
      { query: 'SET @token = ?;', params: [options.token] },
      {
        query: `
          INSERT INTO USERS_REFRESH_TOKENS(
            user_id,
            ip,
            expired_at,
            token
          ) VALUES (
            ?,
            ?,
            @expired_at,
            @token
          ) ON DUPLICATE KEY UPDATE
            expired_at = @expired_at,
            token = @token;
        `,
        params: [options.user_id, options.ip],
      },
    ]);
  }

  /** refresh token별 회원 조회 */
  async findUserByRefreshToken(
    token: string,
    ip: string,
    options?: SelectOptions,
  ): Promise<(User & UserRefreshToken) | undefined> {
    const selectField = options?.select.toString() || 'USERS_REFRESH_TOKENS.*, USERS.*';

    return (<(User & UserRefreshToken)[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM USERS
          LEFT JOIN USERS_REFRESH_TOKENS USING(user_id)
          WHERE USERS_REFRESH_TOKENS.ip = ?
            AND USERS_REFRESH_TOKENS.token = ?;
        `,
        params: [ip, token],
      },
    ]))[0][0];
  }
}
