import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { RdbmsRepository, SelectOptions } from './base/rdbms.repository';

export class UsersRepository extends RdbmsRepository {
  /** id별 회원 조회 */
  async findUserInfoByUserId(user_id: string, options?: SelectOptions): Promise<[User, Group[]] | [undefined, []]> {
    const selectField =
      options?.select.toString() ||
      'USERS.user_id, USERS.social_type, USERS.user_name, USERS.profile_image_url, USERS.profile_color, USERS.is_connect';

    const [groupUserList, groupList] = <any[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM USERS
          WHERE USERS.user_id = ?;
        `,
        params: [user_id],
      },
      {
        query: `
          SELECT GROUPS.group_id
          FROM GROUPS
          JOIN GROUPS_USERS USING (group_id)
          WHERE GROUPS_USERS.user_id = ?;
        `,
        params: [user_id],
      },
    ]);

    return [groupUserList[0], groupList];
  }

  async updateUser(options: {
    user_id: string;
    user_name?: string;
    profile_image_url?: string;
    profile_color?: string;
  }): Promise<[User, Group[]]> {
    await this.sendQuerys([
      {
        query: `
          UPDATE USERS SET
            user_name = COALESCE(?, user_name),
            profile_image_url = COALESCE(?, profile_image_url),
            profile_color = COALESCE(?, profile_color)
          WHERE user_id = ?;
        `,
        params: [
          options?.user_name || null,
          options?.profile_image_url || null,
          options?.profile_color || null,
          options.user_id,
        ],
      },
    ]);

    return <[User, Group[]]>await this.findUserInfoByUserId(options.user_id);
  }
}
