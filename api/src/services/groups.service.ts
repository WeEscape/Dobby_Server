import { BadRequestError } from '../exceptions/BadRequest.exception';
import { ForbiddenError } from '../exceptions/Forbidden.exception';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { GroupInfo } from '../interfaces/groupInfo.interface';
import { GroupsRepository } from '../repositories/groups.repository';
import { errorMessage } from '../utils/message.util';

export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  private async getUsersGroup(user_id: string, group_id: string): Promise<GroupInfo> {
    const groupInfo = await this.groupsRepository.findGroupInfoByGroupId(group_id);
    if (!groupInfo) {
      throw new NotFoundError(errorMessage.notFoundGroup);
    }
    if (!groupInfo.user_ids?.includes(user_id)) {
      throw new ForbiddenError(errorMessage.forbidden);
    }

    return groupInfo;
  }

  private async validateUniqueGroupTitle(group_title: string): Promise<void> {
    const existGroup = <GroupInfo>await this.groupsRepository.findGroupInfoByGroupTitle(group_title);
    if (existGroup) {
      throw new BadRequestError(errorMessage.existTitle);
    }
  }

  async createGroup(user_id: string, group_title: string): Promise<{ group_info: GroupInfo }> {
    await this.validateUniqueGroupTitle(group_title);

    const groupInfo = await this.groupsRepository.createGroup({ user_id, group_title });

    return { group_info: groupInfo };
  }

  async getGroup(user_id: string, group_id: string) {
    const groupInfo = await this.getUsersGroup(user_id, group_id);

    return { group_info: groupInfo };
  }

  async updateGroup(user_id: string, group_id: string, group_title: string): Promise<{ group_info: GroupInfo }> {
    await this.getUsersGroup(user_id, group_id);
    await this.validateUniqueGroupTitle(group_title);

    const groupInfo = await this.groupsRepository.updateGroup({ group_id, group_title });

    return { group_info: groupInfo };
  }

  async joinGroup(user_id: string, group_id: string, invite_code: string): Promise<{ group_info: GroupInfo }> {
    let groupInfo = await this.groupsRepository.findGroupInfoByGroupId(group_id);
    if (!groupInfo) {
      throw new NotFoundError(errorMessage.notFoundGroup);
    }
    if (groupInfo.invite_code !== invite_code) {
      throw new BadRequestError(errorMessage.invalidParameter('invite_code'));
    }
    if (groupInfo.user_ids?.includes(user_id)) {
      throw new BadRequestError(errorMessage.existGroupUser);
    }

    groupInfo = await this.groupsRepository.createGroupUser({ group_id, user_id });

    return { group_info: groupInfo };
  }

  async leaveGroup(user_id: string, group_id: string): Promise<void> {
    const groupInfo = await this.getUsersGroup(user_id, group_id);
    await this.groupsRepository.deleteGroupUser({ group_id, user_id });

    if (groupInfo.user_ids.length === 1) {
      await this.groupsRepository.deleteGroup({ group_id });
    }
  }
}
