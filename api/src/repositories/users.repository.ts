import { User } from '../entities/user.entity';
import { UserInfo } from '../interfaces/userInfo.interface';
import { RdbmsRepository, SelectOptions } from './base/rdbms.repository';

export class UsersRepository extends RdbmsRepository {
  /** id별 회원 검색 */
  async findUserInfoByUserId(user_id: string, options?: SelectOptions): Promise<UserInfo | undefined> {
    const selectField =
      options?.select.toString() ||
      'USERS.user_id, USERS.social_type, USERS.user_name, USERS.profile_image_url, USERS.profile_color, GROUP_CONCAT(GROUPS_USERS.group_id) AS group_ids';

    return (<UserInfo[][] | []>await this.sendQuerys([
      {
        query: `SELECT ${selectField} FROM USERS LEFT JOIN GROUPS_USERS USING(user_id) WHERE USERS.user_id = ? GROUP BY USERS.user_id;`,
        params: [user_id],
      },
    ]))[0][0];
  }

  async updateUser(options: {
    user_id: string;
    user_name?: string;
    profile_image_url?: string;
    profile_color?: string;
  }): Promise<UserInfo> {
    await this.sendQuerys([
      {
        query: `UPDATE USERS SET user_name = COALESCE(?, user_name), profile_image_url = COALESCE(?, profile_image_url), profile_color = COALESCE(?, profile_color) WHERE user_id = ?;`,
        params: [
          options?.user_name || null,
          options?.profile_image_url || null,
          options?.profile_color || null,
          options.user_id,
        ],
      },
    ]);

    return <UserInfo>await this.findUserInfoByUserId(options.user_id);
  }
}
