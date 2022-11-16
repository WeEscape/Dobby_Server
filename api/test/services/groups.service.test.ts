import { GroupInfo } from '../../src/interfaces/groupInfo.interface';
import { errorMessage } from '../../src/utils/message.util';
import { registerData } from '../datas/auth/register.data';
import { TestGenerator } from '../repositories/base/generator';
import { testConatiner } from '../server';

const testGroupsRepository = testConatiner.getGroupsRepository();
const testAuthService = testConatiner.getAuthService();
const testGroupsService = testConatiner.getGroupsService();

describe('Groups Service', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthService.register(registerData.kakao);
    await testAuthService.register(registerData.apple);
  });

  describe('create group', () => {
    it('success', async () => {
      const result = await testGroupsService.createGroup('US111111111111', 'group1');

      expect(result.group_info.group_id).toBe('GR333333333333');
      expect(result.group_info.group_title).toBe('group1');
      expect(result.group_info.invite_code.length).toBe(6);
      expect(result.group_info.user_ids).toContain('US111111111111');
    });

    it('duplicate group title', async () => {
      await expect(async () => await testGroupsService.createGroup('US111111111111', 'group1')).rejects.toThrowError(
        errorMessage.existTitle,
      );
    });
  });

  describe('get group', () => {
    it('success', async () => {
      const result = await testGroupsService.getGroup('US111111111111', 'GR333333333333');

      expect(result.group_info.group_id).toBe('GR333333333333');
      expect(result.group_info.group_title).toBe('group1');
      expect(result.group_info.invite_code.length).toBe(6);
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.getGroup('US111111111111', 'GR444444444444'),
      ).rejects.toThrowError(errorMessage.notFoundGroup);
    });

    it('not join user', async () => {
      await expect(
        async () => await testGroupsService.getGroup('US222222222222', 'GR333333333333'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });
  });

  describe('update group', () => {
    it('success', async () => {
      const result = await testGroupsService.updateGroup('US111111111111', 'GR333333333333', 'update_group1');

      expect(result.group_info.group_id).toBe('GR333333333333');
      expect(result.group_info.group_title).toBe('update_group1');
      expect(result.group_info.invite_code.length).toBe(6);
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.updateGroup('US111111111111', 'GR444444444444', 'update_group1'),
      ).rejects.toThrowError(errorMessage.notFoundGroup);
    });

    it('not join user', async () => {
      await expect(
        async () => await testGroupsService.updateGroup('US222222222222', 'GR333333333333', 'update_group1'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });

    it('duplicate group title', async () => {
      await testGroupsService.createGroup('US111111111111', 'group2');

      await expect(
        async () => await testGroupsService.updateGroup('US111111111111', 'GR333333333333', 'group2'),
      ).rejects.toThrowError(errorMessage.existTitle);
    });
  });

  describe('join group', () => {
    it('success', async () => {
      const result = await testGroupsService.joinGroup('US222222222222', 'GR333333333333', '444444');

      expect(result.group_info.group_id).toBe('GR333333333333');
      expect(result.group_info.user_ids).toContain('US222222222222');
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.joinGroup('US111111111111', 'GR444444444444', '444444'),
      ).rejects.toThrowError(errorMessage.notFoundGroup);
    });

    it('invalid invite code', async () => {
      await expect(
        async () => await testGroupsService.joinGroup('US111111111111', 'GR333333333333', '333333'),
      ).rejects.toThrowError(errorMessage.invalidParameter('invite_code'));
    });

    it('already join user', async () => {
      await expect(
        async () => await testGroupsService.joinGroup('US111111111111', 'GR333333333333', '444444'),
      ).rejects.toThrowError(errorMessage.existGroupUser);
    });
  });

  describe('leave group', () => {
    it('success', async () => {
      await testGroupsService.leaveGroup('US222222222222', 'GR333333333333');

      const group_info = <GroupInfo>await testGroupsRepository.findGroupInfoByGroupId('GR333333333333');

      expect(group_info.user_ids).not.toContain('US222222222222');
    });

    it('not join user', async () => {
      await expect(
        async () => await testGroupsService.leaveGroup('US222222222222', 'GR333333333333'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.leaveGroup('US222222222222', 'GR444444444444'),
      ).rejects.toThrowError(errorMessage.notFoundGroup);
    });

    it('delete group', async () => {
      await testGroupsService.leaveGroup('US111111111111', 'GR333333333333');

      const group_info = <undefined>await testGroupsRepository.findGroupInfoByGroupId('GR333333333333');

      expect(group_info).toBeUndefined();
    });
  });

  afterAll(async () => {
    await testGroupsRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
    ]);
  });
});
