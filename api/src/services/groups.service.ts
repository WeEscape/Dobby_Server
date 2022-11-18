import { BadRequestError } from '../exceptions/BadRequest.exception';
import { ForbiddenError } from '../exceptions/Forbidden.exception';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { GroupInfo } from '../interfaces/groupInfo.interface';
import { GroupsRepository } from '../repositories/groups.repository';
import { errorMessage } from '../utils/message.util';

export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  /** 그룹 제목 검증 */
  private async validateUniqueGroupTitle(group_title: string): Promise<void> {
    const existGroup = <GroupInfo>await this.groupsRepository.findGroupInfoByGroupTitle(group_title);
    if (existGroup) {
      throw new BadRequestError(errorMessage.duplicate);
    }
  }

  /** id별 그룹 조회 */
  private async getGroupByGroupId(user_id: string, group_id: string): Promise<GroupInfo> {
    const groupInfo = await this.groupsRepository.findGroupInfoByGroupId(group_id);
    if (!groupInfo) {
      throw new NotFoundError(errorMessage.notFound);
    }
    if (!groupInfo.user_ids?.includes(user_id)) {
      throw new ForbiddenError(errorMessage.forbidden);
    }

    return groupInfo;
  }

  /** 그룹 참여 여부 검증 */
  async validateUserInGroup(user_id: string, group_id: string): Promise<void> {
    await this.getGroupByGroupId(user_id, group_id);
  }

  /** 그룹 생성 */
  async createGroup(user_id: string, group_title: string): Promise<{ group_info: GroupInfo }> {
    await this.validateUniqueGroupTitle(group_title);

    const groupInfo = await this.groupsRepository.createGroup({ user_id, group_title });

    return { group_info: groupInfo };
  }

  /** 그룹 조회 */
  async getGroup(user_id: string, group_id: string): Promise<{ group_info: GroupInfo }> {
    const groupInfo = await this.getGroupByGroupId(user_id, group_id);

    return { group_info: groupInfo };
  }

  /** 그룹 수정 */
  async updateGroup(user_id: string, group_id: string, group_title: string): Promise<{ group_info: GroupInfo }> {
    await this.validateUserInGroup(user_id, group_id);
    await this.validateUniqueGroupTitle(group_title);

    const groupInfo = await this.groupsRepository.updateGroup({ group_id, group_title });

    return { group_info: groupInfo };
  }

  /** 그룹 가입 */
  async joinGroup(user_id: string, group_id: string, invite_code: string): Promise<{ group_info: GroupInfo }> {
    let groupInfo = await this.groupsRepository.findGroupInfoByGroupId(group_id);
    if (!groupInfo) {
      throw new NotFoundError(errorMessage.notFound);
    }
    if (groupInfo.invite_code !== invite_code) {
      throw new BadRequestError(errorMessage.invalidParameter('invite_code'));
    }
    if (groupInfo.user_ids?.includes(user_id)) {
      throw new BadRequestError(errorMessage.duplicate);
    }

    groupInfo = await this.groupsRepository.createGroupUser({ group_id, user_id });

    return { group_info: groupInfo };
  }

  async leaveGroup(user_id: string, group_id: string): Promise<void> {
    const groupInfo = await this.getGroupByGroupId(user_id, group_id);
    await this.groupsRepository.deleteGroupUser({ group_id, user_id });

    if (groupInfo.user_ids.length === 1) {
      await this.groupsRepository.deleteGroup({ group_id });
    }
  }
}
