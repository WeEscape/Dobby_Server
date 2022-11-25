import { Group } from '../../src/entities/group.entity';
import { User } from '../../src/entities/user.entity';
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
      const result = await testGroupsService.createGroup('US1111111111111111', 'group1');

      expect(result.group.group_id).toBe('GR2020202020202020');
      expect(result.group.group_title).toBe('group1');
      expect(result.group.invite_code.length).toBe(6);
      expect(result.group_user_list.some(user => user.user_id === 'US1111111111111111')).toBeTruthy();
    });

    it('duplicate group title', async () => {
      await expect(
        async () => await testGroupsService.createGroup('US1111111111111111', 'group1'),
      ).rejects.toThrowError(errorMessage.duplicate);
    });
  });

  describe('get group', () => {
    it('success', async () => {
      const result = await testGroupsService.getGroup('US1111111111111111', 'GR2020202020202020');

      expect(result.group.group_id).toBe('GR2020202020202020');
      expect(result.group.group_title).toBe('group1');
      expect(result.group.invite_code.length).toBe(6);
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.getGroup('US1111111111111111', 'GR4444444444444444'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () => {
      await expect(
        async () => await testGroupsService.getGroup('US1010101010101010', 'GR2020202020202020'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });
  });

  describe('update group', () => {
    it('success', async () => {
      const result = await testGroupsService.updateGroup('US1111111111111111', 'GR2020202020202020', 'update_group1');

      expect(result.group.group_id).toBe('GR2020202020202020');
      expect(result.group.group_title).toBe('update_group1');
      expect(result.group.invite_code.length).toBe(6);
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.updateGroup('US1111111111111111', 'GR4444444444444444', 'update_group1'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('not group user', async () => {
      await expect(
        async () => await testGroupsService.updateGroup('US1010101010101010', 'GR2020202020202020', 'update_group1'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });

    it('duplicate group title', async () => {
      await testGroupsService.createGroup('US1111111111111111', 'group2');

      await expect(
        async () => await testGroupsService.updateGroup('US1111111111111111', 'GR2020202020202020', 'group2'),
      ).rejects.toThrowError(errorMessage.duplicate);
    });
  });

  describe('join group', () => {
    it('success', async () => {
      const result = await testGroupsService.joinGroup('US1010101010101010', 'GR2020202020202020', '212121');

      expect(result.group.group_id).toBe('GR2020202020202020');
      expect(result.group_user_list.some(user => user.user_id === 'US1010101010101010')).toBeTruthy();
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.joinGroup('US1010101010101010', 'GR4444444444444444', '212121'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('invalid invite code', async () => {
      await expect(
        async () => await testGroupsService.joinGroup('US1010101010101010', 'GR2020202020202020', '777777'),
      ).rejects.toThrowError(errorMessage.invalidParameter('invite_code'));
    });

    it('group user', async () => {
      console.log(await testGroupsRepository.sendQuerys([{ query: 'SELECT * FROM GROUPS' }]));
      await expect(
        async () => await testGroupsService.joinGroup('US1111111111111111', 'GR2020202020202020', '212121'),
      ).rejects.toThrowError(errorMessage.duplicate);
    });
  });

  describe('leave group', () => {
    it('success', async () => {
      await testGroupsService.leaveGroup('US1010101010101010', 'GR2020202020202020');

      const groupUserList = <User[]>await testGroupsRepository.findGroupUserByGroupId('GR2020202020202020');

      expect(groupUserList.every(user => user.user_id !== 'US1010101010101010')).toBeTruthy();
    });

    it('not group user', async () => {
      await expect(
        async () => await testGroupsService.leaveGroup('US1010101010101010', 'GR2020202020202020'),
      ).rejects.toThrowError(errorMessage.forbidden);
    });

    it('not found group', async () => {
      await expect(
        async () => await testGroupsService.leaveGroup('US1010101010101010', 'GR4444444444444444'),
      ).rejects.toThrowError(errorMessage.notFound);
    });

    it('delete group', async () => {
      await testGroupsService.leaveGroup('US1111111111111111', 'GR2020202020202020');

      const group = <undefined>await testGroupsRepository.findGroupInfoByGroupId('GR2020202020202020');

      expect(group).toBeUndefined();
    });
  });

  afterAll(async () => {
    await testGroupsRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM USERS_REFRESH_TOKENS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
