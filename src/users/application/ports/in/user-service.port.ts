import { PaginatedResponseDto } from '../../../../common/dto/pagination-response.dto';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../../adapters/in/dto/create-user.dto';
import { UpdateUserDto } from '../../../adapters/in/dto/update-user.dto';
import { UserQueryDto } from '../../../adapters/in/dto/user-query.dto';

export interface UserServicePort {
  createUser(createUserDto: CreateUserDto): Promise<User>;
  findAllUsers(query: UserQueryDto): Promise<PaginatedResponseDto<User>>;
  findUserById(id: string): Promise<User>;
  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  deleteUser(id: string): Promise<void>;
}