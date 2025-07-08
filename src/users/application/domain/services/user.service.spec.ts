import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MockUserRepository } from '../../../application/ports/out/mocks/user-repository.mock';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../ports/out/user-repository.port';
import { UserQueryDto } from '../../../adapters/in/dto/user-query.dto';
import { User } from '../entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(() => 'hashed_password'),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepositoryPort>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'hashed_password',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: [],
    roles: ['user'],
    stripeCustomerId: 'cus_123456789',
    stripePaymentMethodId: 'pm_123456789',
    subscriptions: [],
    get hasActiveSubscription() { return true; }
  } as User;

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<UserRepositoryPort> = new MockUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepositoryPort',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get('UserRepositoryPort') as jest.Mocked<UserRepositoryPort>;
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash the password and create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      };

      userRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed_password',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAllUsers', () => {
    it('should return paginated users', async () => {
      const query = {
        page: 1,
        pageSize: 10,
      };

      const users = [mockUser];
      const totalCount = 1;

      userRepository.findAll.mockResolvedValue([users, totalCount]);

      const result = await userService.findAllUsers(query as UserQueryDto);

      expect(userRepository.findAll).toHaveBeenCalledWith(query, {
        relations: ['posts', 'subscriptions'],
      });
      expect(result).toEqual({
        data: users,
        meta: {
          page: 1,
          pageSize: 10,
          totalItems: totalCount,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });
    });

    it('should use default pagination values if not provided', async () => {
      const query = new UserQueryDto();
      const users = [mockUser];
      const totalCount = 1;

      userRepository.findAll.mockResolvedValue([users, totalCount]);

      const result = await userService.findAllUsers(query);

      expect(result.meta).toEqual({
        page: 1,
        pageSize: 10,
        totalItems: totalCount,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    });
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findUserById('1');

      expect(userRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['posts', 'subscriptions'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.findUserById('1')).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['posts', 'subscriptions'],
      });
    });
  });

  describe('updateUser', () => {
    it('should update user without password', async () => {
      const updateUserDto = {
        fullName: 'Updated Name'
      };

      userRepository.findById.mockResolvedValue(mockUser);

      // Tạo updatedUser giữ lại getter properties
      const updatedUser = Object.create(Object.getPrototypeOf(mockUser));
      Object.assign(updatedUser, mockUser, updateUserDto);

      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updateUserDto);

      expect(userRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['posts', 'subscriptions'],
      });
      expect(userRepository.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result.fullName).toBe('Updated Name');
    });

    it('should update user with hashed password', async () => {
      const updateUserDto = {
        fullName: 'Updated Name',
        password: 'newPassword123'
      };

      userRepository.findById.mockResolvedValue(mockUser);

      // Tạo updatedUser giữ lại getter properties
      const updatedUser = Object.create(Object.getPrototypeOf(mockUser));
      Object.assign(updatedUser, mockUser, {
        fullName: updateUserDto.fullName,
        password: 'hashed_password'
      });

      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(userRepository.update).toHaveBeenCalledWith('1', {
        ...updateUserDto,
        password: 'hashed_password'
      });
      expect(result.fullName).toBe('Updated Name');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('1', { fullName: 'Updated Name' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await userService.deleteUser('1');

      expect(userRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['posts', 'subscriptions'],
      });
      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('1')).rejects.toThrow(NotFoundException);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });
});