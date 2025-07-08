import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { UserServicePort } from '../../../application/ports/in/user-service.port';
import { UserRepositoryPort } from '../../../application/ports/out/user-repository.port';
import { CreateUserDto } from '../../../adapters/in/dto/create-user.dto';
import { UpdateUserDto } from '../../../adapters/in/dto/update-user.dto';
import { User } from '../../domain/entities/user.entity';
import { PaginatedResponseDto } from '../../../../common/dto/pagination-response.dto';
import { UserQueryDto } from '../../../adapters/in/dto/user-query.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService implements UserServicePort {
  constructor(@Inject('UserRepositoryPort') private readonly userRepository: UserRepositoryPort) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findAllUsers(query: UserQueryDto): Promise<PaginatedResponseDto<User>> {
    const [users, totalCount] = await this.userRepository.findAll(query, {
      relations: ['posts', 'subscriptions'],
    });
    return new PaginatedResponseDto<User>(
      users,
      query.page ?? 1,
      query.pageSize ?? 10,
      totalCount,
    );
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id, {
      relations: ['posts', 'subscriptions'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findUserById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<void> {
    await this.findUserById(id);
    await this.userRepository.delete(id);
  }
}