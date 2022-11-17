import { Group } from '../entities/group.entity';
import { GroupInfo } from '../interfaces/groupInfo.interface';
import { RdbmsRepository, SelectOptions } from './base/rdbms.repository';

export class GroupsRepository extends RdbmsRepository {
  /** 그룹 제목별 그룹 조회 */
  async findGroupInfoByGroupTitle(group_title: string, options?: SelectOptions) {
    const selectField = options?.select.toString() || 'GROUPS.*';

    return (<Group[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM GROUPS
          WHERE group_title = ?
          GROUP BY GROUPS.group_id;
        `,
        params: [group_title],
      },
    ]))[0][0];
  }

  /** 그룹 id별 그룹 조회 */
  async findGroupInfoByGroupId(group_id: string, options?: SelectOptions): Promise<GroupInfo | undefined> {
    const selectField = options?.select.toString() || 'GROUPS.*, GROUP_CONCAT(GROUPS_USERS.user_id) AS user_ids';

    const groupInfo = (<any[][] | [][]>await this.sendQuerys([
      {
        query: `
          SELECT ${selectField}
          FROM GROUPS
          LEFT JOIN GROUPS_USERS USING(group_id)
          WHERE GROUPS.group_id = ?
          GROUP BY GROUPS.group_id;
        `,
        params: [group_id],
      },
    ]))[0][0];

    if (groupInfo?.user_ids) {
      groupInfo.user_ids = groupInfo.user_ids.split(',');
    }

    return groupInfo;
  }

  /** 그룹 생성 */
  async createGroup(options: { user_id: string; group_title: string }): Promise<GroupInfo> {
    const groupId = 'GR' + this.generateId();
    const inviteCode = this.generator.generateRandomString(6);

    await this.sendQuerys([
      {
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
        params: [groupId, options.user_id, options.group_title, inviteCode],
      },
      {
        query: `
          INSERT INTO GROUPS_USERS(
            group_id,
            user_id
          ) VALUES (
            ?,
            ?
          );
        `,
        params: [groupId, options.user_id],
      },
    ]);

    return <GroupInfo>await this.findGroupInfoByGroupId(groupId);
  }

  /** 그룹 수정 */
  async updateGroup(options: { group_id: string; group_title: string }): Promise<GroupInfo> {
    await this.sendQuerys([
      {
        query: `
          UPDATE GROUPS SET
            group_title = ?
          WHERE group_id = ?;
        `,
        params: [options.group_title, options.group_id],
      },
    ]);

    return <GroupInfo>await this.findGroupInfoByGroupId(options.group_id);
  }

  /** 그룹 삭제 */
  async deleteGroup(options: { group_id: string }): Promise<void> {
    await this.sendQuerys([
      {
        query: `
          DELETE GROUPS, GROUPS_USERS, CATEGORIES, TASKS, TASKS_USERS 
          FROM GROUPS
          LEFT JOIN GROUPS_USERS USING(group_id)
          LEFT JOIN CATEGORIES USING(group_id)
          LEFT JOIN TASKS USING(category_id)
          LEFT JOIN TASKS_USERS USING(task_id)
          WHERE group_id = ?;
        `,
        params: [options.group_id],
      },
    ]);
  }

  /** 그룹 회원 생성 */
  async createGroupUser(options: { group_id: string; user_id: string }): Promise<GroupInfo> {
    await this.sendQuerys([
      {
        query: `
          INSERT INTO GROUPS_USERS(
            group_id,
            user_id
          ) VALUES (
            ?,
            ?
          );
        `,
        params: [options.group_id, options.user_id],
      },
    ]);

    return <GroupInfo>await this.findGroupInfoByGroupId(options.group_id);
  }

  /** 그룹 회원 삭제 */
  async deleteGroupUser(options: { group_id: string; user_id: string }): Promise<void> {
    await this.sendQuerys([
      {
        query: `
          DELETE
          FROM GROUPS_USERS
          WHERE group_id = ?
            AND user_id =?;
        `,
        params: [options.group_id, options.user_id],
      },
    ]);
  }
}
