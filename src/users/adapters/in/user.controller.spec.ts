import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserServicePort } from '../../application/ports/in/user-service.port';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../application/domain/entities/user.entity';
import { PaginatedResponseDto } from '../../../common/dto/pagination-response.dto';
import { MockUserService } from '../../application/ports/in/mocks/user-service.mock';
import { UserQueryDto } from './dto/user-query.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserServicePort>;

  const mockUser = {
    id: '1',
    email: 'johndoe@gmail.com',
    fullName: 'John Doe',
    password: 'Password123!',
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

  const mockPaginatedResponse: PaginatedResponseDto<User> = {
    data: [mockUser],
    meta: {
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  beforeEach(async () => {
    const mockUserService: jest.Mocked<UserServicePort> = new MockUserService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: 'UserServicePort',
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserServicePort>('UserServicePort') as jest.Mocked<UserServicePort>;
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: mockUser.email,
        fullName: mockUser.fullName,
        password: mockUser.password,
      };

      userService.createUser.mockResolvedValue(mockUser);

      const result = await userController.createUser(createUserDto);

      expect(result).toBe(mockUser);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAllUsers', () => {
    it('should return paginated users', async () => {
      const query = {
        page: 1,
        pageSize: 10,
        searchKey: 'john',
      };

      userService.findAllUsers.mockResolvedValue(mockPaginatedResponse);

      const result = await userController.findAllUsers(query as UserQueryDto);

      expect(result).toBe(mockPaginatedResponse);
      expect(userService.findAllUsers).toHaveBeenCalledWith(query);
    });
  });

  describe('findUserById', () => {
    it('should return a user by id', async () => {
      userService.findUserById.mockResolvedValue(mockUser);

      const result = await userController.findUserById('1');

      expect(result).toBe(mockUser);
      expect(userService.findUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'John Updated',
      };

      const updatedUser = Object.create(mockUser);
      updatedUser.fullName = 'John Updated';

      userService.updateUser.mockResolvedValue(updatedUser);

      const result = await userController.updateUser('1', updateUserDto);

      expect(result).toBe(updatedUser);
      expect(userService.updateUser).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      userService.deleteUser.mockResolvedValue(undefined);

      await userController.deleteUser('1');

      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });
  });
});
