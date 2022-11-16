import { GroupInfo } from '../../src/interfaces/groupInfo.interface';
import { registerData } from '../datas/auth/register.data';
import { testConatiner } from '../server';
import { TestGenerator } from './base/generator';

const testAuthRepository = testConatiner.getAuthRepository();
const testGroupsRepository = testConatiner.getGroupsRepository();

describe('Groups Repository', () => {
  beforeAll(async () => {
    (<TestGenerator>testConatiner.getGenerator()).resetCount();
    await testAuthRepository.createUser(registerData.kakao);
    await testAuthRepository.createUser(registerData.apple);
  });

  describe('create group', () => {
    it('success', async () => {
      const groupInfo = <GroupInfo>(
        await testGroupsRepository.createGroup({ user_id: 'US111111111111', group_title: 'group1' })
      );

      expect(groupInfo.group_id).toBe('GR333333333333');
      expect(groupInfo.group_title).toBe('group1');
      expect(groupInfo.invite_code.length).toBe(6);
      expect(groupInfo.user_ids).toContain('US111111111111');
    });
  });

  describe('find group info by group id and group title', () => {
    it('group info', async () => {
      const groupInfo = <GroupInfo>await testGroupsRepository.findGroupInfoByGroupTitle('group1');

      expect(groupInfo.group_id).toBe('GR333333333333');
      expect(groupInfo.group_title).toBe('group1');
      expect(groupInfo.invite_code.length).toBe(6);
    });

    it('undefined', async () => {
      const groupInfo = <GroupInfo>await testGroupsRepository.findGroupInfoByGroupTitle('group2');

      expect(groupInfo).toBeUndefined();
    });
  });

  describe('find group info by group id', () => {
    it('group info', async () => {
      const groupInfo = <GroupInfo>await testGroupsRepository.findGroupInfoByGroupId('GR333333333333');

      expect(groupInfo.group_id).toBe('GR333333333333');
      expect(groupInfo.group_title).toBe('group1');
      expect(groupInfo.invite_code.length).toBe(6);
    });

    it('undefined', async () => {
      const groupInfo = <GroupInfo>await testGroupsRepository.findGroupInfoByGroupId('GR444444444444');

      expect(groupInfo).toBeUndefined();
    });
  });

  describe('update group', () => {
    it('success', async () => {
      const groupInfo = <GroupInfo>(
        await testGroupsRepository.updateGroup({ group_id: 'GR333333333333', group_title: 'update_group1' })
      );

      expect(groupInfo.group_id).toBe('GR333333333333');
      expect(groupInfo.group_title).toBe('update_group1');
      expect(groupInfo.invite_code.length).toBe(6);
    });
  });

  describe('create group user', () => {
    it('success', async () => {
      await testGroupsRepository.createGroupUser({ group_id: 'GR333333333333', user_id: 'US222222222222' });

      const groupInfo = <GroupInfo>await testGroupsRepository.findGroupInfoByGroupId('GR333333333333');

      expect(groupInfo.user_ids).toContain('US222222222222');
    });
  });

  describe('delete group user', () => {
    it('success', async () => {
      await testGroupsRepository.deleteGroupUser({ group_id: 'GR333333333333', user_id: 'US222222222222' });

      const groupInfo = <GroupInfo>await testGroupsRepository.findGroupInfoByGroupId('GR333333333333');

      expect(groupInfo.user_ids).not.toContain('US222222222222');
    });
  });

  describe('delete group', () => {
    it('success', async () => {
      await testGroupsRepository.deleteGroup({ group_id: 'GR333333333333' });

      const groupInfo = <undefined>await testGroupsRepository.findGroupInfoByGroupId('GR333333333333');

      expect(groupInfo).toBeUndefined();
    });
  });

  afterAll(async () => {
    await testGroupsRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
    ]);
  });
});
