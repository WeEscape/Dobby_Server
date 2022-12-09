import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { BadRequestError } from '../exceptions/BadRequest.exception';
import { ForbiddenError } from '../exceptions/Forbidden.exception';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { GroupsRepository } from '../repositories/groups.repository';
import { errorMessage } from '../utils/message.util';

export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  /** 그룹 제목 검증 */
  private async validateUniqueGroupTitle(group_title: string): Promise<void> {
    const existGroup = <Group>await this.groupsRepository.findGroupInfoByGroupTitle(group_title);
    if (existGroup) {
      throw new BadRequestError(errorMessage.duplicate);
    }
  }

  /** id별 그룹 조회 */
  private async getGroupByGroupId(user_id: string, group_id: string): Promise<[Group, User[]]> {
    const group = await this.groupsRepository.findGroupInfoByGroupId(group_id);
    if (!group) {
      throw new NotFoundError(errorMessage.notFound);
    }
    const groupUserList = await this.groupsRepository.findGroupUserByGroupId(group_id);
    if (!groupUserList.some(user => user.user_id === user_id)) {
      throw new ForbiddenError(errorMessage.forbidden);
    }

    return [group, groupUserList];
  }

  /** 그룹 참여 여부 검증 */
  async validateUserInGroup(user_id: string, group_id: string): Promise<void> {
    await this.getGroupByGroupId(user_id, group_id);
  }

  /** 그룹 생성 */
  async createGroup(user_id: string, group_title: string): Promise<{ group: Group; group_user_list: User[] }> {
    await this.validateUniqueGroupTitle(group_title);

    const group = await this.groupsRepository.createGroup({ user_id, group_title });
    const groupUserList = await this.groupsRepository.findGroupUserByGroupId(group.group_id);

    return { group, group_user_list: groupUserList };
  }

  /** 그룹 조회 */
  async getGroup(user_id: string, group_id: string): Promise<{ group: Group; group_user_list: User[] }> {
    const [group, groupUserList] = await this.getGroupByGroupId(user_id, group_id);

    return { group, group_user_list: groupUserList };
  }

  /** 그룹 수정 */
  async updateGroup(
    user_id: string,
    group_id: string,
    group_title: string,
  ): Promise<{ group: Group; group_user_list: User[] }> {
    await this.validateUserInGroup(user_id, group_id);
    await this.validateUniqueGroupTitle(group_title);

    const group = await this.groupsRepository.updateGroup({ group_id, group_title });
    const groupUserList = await this.groupsRepository.findGroupUserByGroupId(group_id);

    return { group, group_user_list: groupUserList };
  }

  /** 그룹 가입 */
  async joinGroup(user_id: string, invite_code: string): Promise<{ group: Group; group_user_list: User[] }> {
    let group = await this.groupsRepository.findGroupInfoByInviteCode(invite_code);
    if (!group) {
      throw new BadRequestError(errorMessage.invalidParameter('invite_code'));
    }
    const existGroupUserList = await this.groupsRepository.findGroupUserByGroupId(group.group_id);
    if (existGroupUserList.some(user => user.user_id === user_id)) {
      throw new BadRequestError(errorMessage.duplicate);
    }

    const groupUserList = await this.groupsRepository.createGroupUser({ group_id: group.group_id, user_id });

    return { group, group_user_list: groupUserList };
  }

  /** 그룹 탈퇴 */
  async leaveGroup(user_id: string, group_id: string): Promise<void> {
    const [group, groupUserList] = await this.getGroupByGroupId(user_id, group_id);
    await this.groupsRepository.deleteGroupUser({ group_id, user_id });

    if (groupUserList.length === 1) {
      await this.groupsRepository.deleteGroup({ group_id });
    }
  }
}
