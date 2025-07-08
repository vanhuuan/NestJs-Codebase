import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from '../../application/domain/entities/user.entity';
import { Post } from '../../../posts/application/domain/entities/post.entity';
import { CreateUserDto } from '../in/dto/create-user.dto';
import { UserQueryDto } from '../in/dto/user-query.dto';
import { SortDirection } from '../../../common/dto/base-query.dto';
import { PostgresTestContainer } from '../../../common/test/postgres-test-container';
import { Subscription } from '../../../../src/subscriptions/application/domain/entities/subscription.entity';

describe('UserRepository Integration Tests', () => {
  let userRepository: UserRepository;
  let testingModule: TestingModule;
  let rawRepository: Repository<User>;
  let postgresContainer: PostgresTestContainer;

  beforeAll(async () => {
    postgresContainer = new PostgresTestContainer();
    const container = await postgresContainer.start();
    console.log(`PostgreSQL container started at ${container.getHost()}:${container.getPort()}`);

    // Create testing module with container connection
    testingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(postgresContainer.getTypeOrmConfig([User, Post, Subscription])),
        TypeOrmModule.forFeature([User, Post, Subscription]),
      ],
      providers: [UserRepository],
    }).compile();

    userRepository = testingModule.get<UserRepository>(UserRepository);
    rawRepository = testingModule.get<Repository<User>>(getRepositoryToken(User));

    await rawRepository.query('TRUNCATE TABLE "users" CASCADE');
    await rawRepository.query('TRUNCATE TABLE "posts" CASCADE');
  }, 60000);

  afterAll(async () => {
    await testingModule?.close();
    await postgresContainer?.stop();
  });

  beforeEach(async () => {
    // Clean tables before each test
    await rawRepository.query('TRUNCATE TABLE "users" CASCADE');
    await rawRepository.query('TRUNCATE TABLE "posts" CASCADE');
  });

  describe('findAll', () => {
    it('should return users with pagination', async () => {
      const users = [
        { email: 'user1@example.com', fullName: 'User One', password: 'password', isActive: true },
        { email: 'user2@example.com', fullName: 'User Two', password: 'password', isActive: true },
        { email: 'user3@example.com', fullName: 'User Three', password: 'password', isActive: false },
      ];

      for (const user of users) {
        await userRepository.create(user as CreateUserDto);
      }

      const query = {
        page: 1,
        pageSize: 2,
      };

      const [result, count] = await userRepository.findAll(query as UserQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(3);
    });

    it('should filter users by isActive', async () => {
      const users = [
        { email: 'user1@example.com', fullName: 'User One', password: 'password', isActive: true },
        { email: 'user2@example.com', fullName: 'User Two', password: 'password', isActive: true },
        { email: 'user3@example.com', fullName: 'User Three', password: 'password', isActive: false },
      ];

      for (const user of users) {
        await userRepository.create(user as CreateUserDto);
      }

      const query= {
        isActive: true ,
      };

      const [result, count] = await userRepository.findAll(query as UserQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(2);
      expect(result.every(user => user.isActive)).toBe(true);
    });

    it('should search users by email or fullName', async () => {
      const users = [
        { email: 'john@example.com', fullName: 'John Doe', password: 'password', isActive: true },
        { email: 'jane@example.com', fullName: 'Jane Smith', password: 'password', isActive: true },
        { email: 'alice@example.com', fullName: 'Alice Johnson', password: 'password', isActive: true },
      ];

      for (const user of users) {
        await userRepository.create(user as CreateUserDto);
      }

      const query = {
        searchKey: 'doe',
      };

      const [result, count] = await userRepository.findAll(query as UserQueryDto);

      expect(result).toHaveLength(1);
      expect(count).toBe(1);
      expect(result[0].fullName).toBe('John Doe');
    });

    it('should sort users by specified field', async () => {
      const users = [
        { email: 'john@example.com', fullName: 'John Doe', password: 'password', isActive: true },
        { email: 'jane@example.com', fullName: 'Jane Smith', password: 'password', isActive: true },
        { email: 'alice@example.com', fullName: 'Alice Johnson', password: 'password', isActive: true },
      ];

      for (const user of users) {
        await userRepository.create(user as CreateUserDto);
      }

      const query = {
        sortBy: 'fullName',
        sortDirection: SortDirection.ASC,
      };

      const [result, count] = await userRepository.findAll(query as UserQueryDto);

      expect(result).toHaveLength(3);
      expect(count).toBe(3);
      expect(result[0].fullName).toBe('Alice Johnson');
      expect(result[1].fullName).toBe('Jane Smith');
      expect(result[2].fullName).toBe('John Doe');
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      };

      await userRepository.create(createUserDto);

      const result = await userRepository.findByEmail(createUserDto.email);

      expect(result).toBeDefined();
      expect(result?.email).toBe(createUserDto.email);
    });

    it('should return null if user not found', async () => {
      const result = await userRepository.findByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });
});