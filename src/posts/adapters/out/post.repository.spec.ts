import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostRepository } from './post.repository';
import { Post } from '../../application/domain/entities/post.entity';
import { User } from '../../../users/application/domain/entities/user.entity';
import { CreatePostDto } from '../in/dto/create-post.dto';
import { PostQueryDto } from '../in/dto/post-query.dto';
import { SortDirection } from '../../../common/dto/base-query.dto';
import { PostgresTestContainer } from '../../../common/test/postgres-test-container';
import { Subscription } from '../../../subscriptions/application/domain/entities/subscription.entity';

describe('PostRepository Integration Tests', () => {
  let postRepository: PostRepository;
  let userRepository: Repository<User>;
  let testingModule: TestingModule;
  let rawRepository: Repository<Post>;
  let testUser: User;
  let postgresContainer: PostgresTestContainer;

  beforeAll(async () => {
    postgresContainer = new PostgresTestContainer();
    const container = await postgresContainer.start();
    console.log(`PostgreSQL container started at ${container.getHost()}:${container.getPort()}`);

    // Create testing module with container connection
    testingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(postgresContainer.getTypeOrmConfig([Post, User, Subscription])),
        TypeOrmModule.forFeature([Post, User, Subscription]),
      ],
      providers: [PostRepository],
    }).compile();

    postRepository = testingModule.get<PostRepository>(PostRepository);
    rawRepository = testingModule.get<Repository<Post>>(getRepositoryToken(Post));
    userRepository = testingModule.get<Repository<User>>(getRepositoryToken(User));

    await rawRepository.query('TRUNCATE TABLE "posts" CASCADE');
    await userRepository.query('TRUNCATE TABLE "users" CASCADE');
  }, 60000);

  afterAll(async () => {
    await testingModule?.close();
    await postgresContainer?.stop();
  });

  beforeEach(async () => {
    // Clean tables before each test
    await rawRepository.query('TRUNCATE TABLE "posts" CASCADE');
    await userRepository.query('TRUNCATE TABLE "users" CASCADE');

    testUser = await userRepository.save({
      email: 'test@example.com',
      fullName: 'Test User',
      password: 'password123',
      isActive: true
    });
  });

  describe('findAll', () => {
    it('should return posts with pagination', async () => {
      const posts = [
        { title: 'Post One', content: 'Content 1', published: true, userId: testUser.id },
        { title: 'Post Two', content: 'Content 2', published: true, userId: testUser.id },
        { title: 'Post Three', content: 'Content 3', published: false, userId: testUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query: Partial<PostQueryDto> = {
        page: 1,
        pageSize: 2,
      };

      const [result, count] = await postRepository.findAll(query as PostQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(3);
    });

    it('should filter posts by published status', async () => {
      const posts = [
        { title: 'Post One', content: 'Content 1', published: true, userId: testUser.id },
        { title: 'Post Two', content: 'Content 2', published: true, userId: testUser.id },
        { title: 'Post Three', content: 'Content 3', published: false, userId: testUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query: Partial<PostQueryDto> = {
        published: true
      };

      const [result, count] = await postRepository.findAll(query as PostQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(2);
      expect(result.every(post => post.published)).toBe(true);
    });

    it('should filter posts by userId', async () => {
      const anotherUser = await userRepository.save(userRepository.create({
        email: 'another@example.com',
        fullName: 'Another User',
        password: 'password123',
        isActive: true
      }));

      const posts = [
        { title: 'Post One', content: 'Content 1', published: true, userId: testUser.id },
        { title: 'Post Two', content: 'Content 2', published: true, userId: testUser.id },
        { title: 'Post Three', content: 'Content 3', published: true, userId: anotherUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query: Partial<PostQueryDto> = {
        userId: testUser.id,
      };

      const [result, count] = await postRepository.findAll(query as PostQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(2);
      expect(result.every(post => post.userId === testUser.id)).toBe(true);
    });

    it('should search posts by title or content', async () => {
      const posts = [
        { title: 'Finding Nemo', content: 'A story about fish', published: true, userId: testUser.id },
        { title: 'The Matrix', content: 'A story about virtual reality', published: true, userId: testUser.id },
        { title: 'Inception', content: 'A story about dreams and nemo too', published: true, userId: testUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query: Partial<PostQueryDto> = {
        searchKey: 'nemo',
      };

      const [result, count] = await postRepository.findAll(query as PostQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(2);
      expect(result.some(post => post.title === 'Finding Nemo')).toBe(true);
      expect(result.some(post => post.title === 'Inception')).toBe(true);
    });

    it('should sort posts by specified field', async () => {
      const posts = [
        { title: 'C Post', content: 'Content C', published: true, userId: testUser.id },
        { title: 'A Post', content: 'Content A', published: true, userId: testUser.id },
        { title: 'B Post', content: 'Content B', published: true, userId: testUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query: Partial<PostQueryDto> = {
        sortBy: 'title',
        sortDirection: SortDirection.ASC,
      };

      const [result, count] = await postRepository.findAll(query as PostQueryDto);

      expect(result).toHaveLength(3);
      expect(count).toBe(3);
      expect(result[0].title).toBe('A Post');
      expect(result[1].title).toBe('B Post');
      expect(result[2].title).toBe('C Post');
    });
  });

  describe('findByUserId', () => {
    it('should find all posts for a specific user', async () => {
      const anotherUser = await userRepository.save(userRepository.create({
        email: 'another@example.com',
        fullName: 'Another User',
        password: 'password123',
        isActive: true
      }));

      const posts = [
        { title: 'User Post 1', content: 'Content 1', published: true, userId: testUser.id },
        { title: 'User Post 2', content: 'Content 2', published: false, userId: testUser.id },
        { title: 'Other Post', content: 'Content 3', published: true, userId: anotherUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query = new PostQueryDto();
      const [result, count] = await postRepository.findByUserId(testUser.id, query);

      expect(result).toHaveLength(2);
      expect(count).toBe(2);
      expect(result.every(post => post.userId === testUser.id)).toBe(true);
    });

    it('should apply filters when finding posts by userId', async () => {
      const posts = [
        { title: 'User Post 1', content: 'Content 1', published: true, userId: testUser.id },
        { title: 'User Post 2', content: 'Content 2', published: false, userId: testUser.id },
        { title: 'User Post 3', content: 'Content 3', published: true, userId: testUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query: Partial<PostQueryDto> = {
        published: true
      };

      const [result, count] = await postRepository.findByUserId(testUser.id, query as PostQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(2);
      expect(result.every(post => post.published)).toBe(true);
    });

    it('should apply search when finding posts by userId', async () => {
      const posts = [
        { title: 'Special Post', content: 'Special content', published: true, userId: testUser.id },
        { title: 'Regular Post', content: 'Regular content', published: true, userId: testUser.id },
        { title: 'Another Post', content: 'Has special words', published: true, userId: testUser.id },
      ];

      for (const post of posts) {
        await postRepository.create(post as CreatePostDto);
      }

      const query: Partial<PostQueryDto> = {
        searchKey: 'special'
      };

      const [result, count] = await postRepository.findByUserId(testUser.id, query as PostQueryDto);

      expect(result).toHaveLength(2);
      expect(count).toBe(2);
    });
  });
});
