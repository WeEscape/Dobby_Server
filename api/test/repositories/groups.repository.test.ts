import { Group } from '../../src/entities/group.entity';
import { GroupUser } from '../../src/entities/groupUser.entity';
import { User } from '../../src/entities/user.entity';
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
      const group = <Group>(
        await testGroupsRepository.createGroup({ user_id: 'US1111111111111111', group_title: 'group1' })
      );

      expect(group.group_id).toBe('GR2020202020202020');
      expect(group.group_title).toBe('group1');
      expect(group.invite_code.length).toBe(6);
    });
  });

  describe('find group by group id and group title', () => {
    it('group', async () => {
      const group = <Group>await testGroupsRepository.findGroupInfoByGroupTitle('group1');

      expect(group.group_id).toBe('GR2020202020202020');
      expect(group.group_title).toBe('group1');
      expect(group.invite_code.length).toBe(6);
    });

    it('undefined', async () => {
      const group = <undefined>await testGroupsRepository.findGroupInfoByGroupTitle('group2');

      expect(group).toBeUndefined();
    });
  });

  describe('find group by group id', () => {
    it('group', async () => {
      const group = <Group>await testGroupsRepository.findGroupInfoByGroupId('GR2020202020202020');

      expect(group.group_id).toBe('GR2020202020202020');
      expect(group.group_title).toBe('group1');
      expect(group.invite_code.length).toBe(6);
    });

    it('undefined', async () => {
      const group = <undefined>await testGroupsRepository.findGroupInfoByGroupId('GR4444444444444444');

      expect(group).toBeUndefined();
    });
  });

  describe('find group user by group id', () => {
    it('group', async () => {
      const userList = <User[]>await testGroupsRepository.findGroupUserByGroupId('GR2020202020202020');

      userList.forEach(user => {
        expect(typeof user.user_id).toBe('string');
        expect(typeof user.user_name).toBe('string');
        expect(typeof user.profile_image_url).toBe('string');
        expect(typeof user.profile_color).toBe('string');
      });
    });

    it('undefined', async () => {
      const group = <undefined>await testGroupsRepository.findGroupInfoByGroupId('GR4444444444444444');

      expect(group).toBeUndefined();
    });
  });

  describe('update group', () => {
    it('success', async () => {
      const group = <Group>(
        await testGroupsRepository.updateGroup({ group_id: 'GR2020202020202020', group_title: 'update_group1' })
      );

      expect(group.group_id).toBe('GR2020202020202020');
      expect(group.group_title).toBe('update_group1');
      expect(group.invite_code.length).toBe(6);
    });
  });

  describe('create group user', () => {
    it('success', async () => {
      await testGroupsRepository.createGroupUser({ group_id: 'GR2020202020202020', user_id: 'US1010101010101010' });

      const groupUserList = <GroupUser[]>await testGroupsRepository.findGroupUserByGroupId('GR2020202020202020');

      expect(groupUserList.some(user => user.user_id === 'US1010101010101010')).toBeTruthy();
    });
  });

  describe('delete group user', () => {
    it('success', async () => {
      await testGroupsRepository.deleteGroupUser({ group_id: 'GR2020202020202020', user_id: 'US1010101010101010' });

      const groupUserList = <GroupUser[]>await testGroupsRepository.findGroupUserByGroupId('GR2020202020202020');

      expect(groupUserList.every(user => user.user_id !== 'US1010101010101010')).toBeTruthy();
    });
  });

  describe('delete group', () => {
    it('success', async () => {
      await testGroupsRepository.deleteGroup({ group_id: 'GR2020202020202020' });

      const group = <undefined>await testGroupsRepository.findGroupInfoByGroupId('GR2020202020202020');

      expect(group).toBeUndefined();
    });
  });

  afterAll(async () => {
    await testGroupsRepository.sendQuerys([
      { query: `DELETE FROM USERS;` },
      { query: `DELETE FROM GROUPS;` },
      { query: `DELETE FROM GROUPS_USERS;` },
      { query: `DELETE FROM CATEGORIES;` },
    ]);
  });
});
