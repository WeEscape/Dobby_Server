import { UpdateUserDto } from '../dtos/users/updateUser.dto';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { UserInfo } from '../interfaces/userInfo.interface';
import { UsersRepository } from '../repositories/users.repository';
import { errorMessage } from '../utils/message.util';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserInfo(user_id: string): Promise<{ user_info: UserInfo }> {
    const userInfo = await this.usersRepository.findUserInfoByUserId(user_id);
    if (!userInfo) {
      throw new NotFoundError(errorMessage.notFoundUser);
    }

    return { user_info: userInfo };
  }

  async updateUser(user_id: string, updateUserDto: UpdateUserDto): Promise<{ user_info: UserInfo }> {
    const userInfo = await this.usersRepository.updateUser({ user_id, ...updateUserDto });

    return { user_info: userInfo };
  }
}
