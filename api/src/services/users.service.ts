import { UpdateUserDto } from '../dtos/users/updateUser.dto';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { UsersRepository } from '../repositories/users.repository';
import { errorMessage } from '../utils/message.util';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /** 회원 조회 */
  async getUserInfo(user_id: string): Promise<{ user: User; group_list: Group[] | [] }> {
    const [user, groupList] = await this.usersRepository.findUserInfoByUserId(user_id);
    if (!user) {
      throw new NotFoundError(errorMessage.notFound);
    }

    return { user, group_list: groupList };
  }

  /** 회원 수정 */
  async updateUser(user_id: string, updateUserDto: UpdateUserDto): Promise<{ user: User; group_list: Group[] | [] }> {
    const [user, groupList] = await this.usersRepository.updateUser({ user_id, ...updateUserDto });

    return { user, group_list: groupList };
  }
}
