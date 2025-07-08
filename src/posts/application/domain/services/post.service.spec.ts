import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { MockPostRepository } from '../../../application/ports/out/mocks/post-repository.mock';
import { NotFoundException } from '@nestjs/common';
import { PostRepositoryPort } from '../../ports/out/post-repository.port';
import { User } from '../../../../users/application/domain/entities/user.entity';
import { PostQueryDto } from '../../../adapters/in/dto/post-query.dto';

describe('PostService', () => {
  let postService: PostService;
  let postRepository: jest.Mocked<PostRepositoryPort>;

  const mockPost = {
    id: '1',
    title: 'Test Post',
    content: 'This is test content',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
    user: new User(),
  };

  beforeEach(async () => {
    const mockPostRepository: jest.Mocked<PostRepositoryPort> = new MockPostRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: 'PostRepositoryPort',
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    postRepository = module.get('PostRepositoryPort') as jest.Mocked<PostRepositoryPort>;
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'This is test content',
        userId: 'user1',
      };

      postRepository.create.mockResolvedValue(mockPost);
      const result = await postService.createPost(createPostDto);

      expect(postRepository.create).toHaveBeenCalledWith(createPostDto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAllPosts', () => {
    it('should return paginated posts', async () => {
      const query = {
        page: 1,
        pageSize: 10,
      };

      const posts = [mockPost];
      const totalCount = 1;

      postRepository.findAll.mockResolvedValue([posts, totalCount]);

      const result = await postService.findAllPosts(query as PostQueryDto);

      expect(postRepository.findAll).toHaveBeenCalledWith(query, {
        relations: ['user']
      });
      expect(result).toEqual({
        data: posts,
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
      const query = {};
      const posts = [mockPost];
      const totalCount = 1;

      postRepository.findAll.mockResolvedValue([posts, totalCount]);

      const result = await postService.findAllPosts(query as PostQueryDto);

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

  describe('findPostById', () => {
    it('should return a post if found', async () => {
      postRepository.findById.mockResolvedValue(mockPost);

      const result = await postService.findPostById('1');

      expect(postRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['user'],
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findById.mockResolvedValue(null);

      await expect(postService.findPostById('1')).rejects.toThrow(NotFoundException);
      expect(postRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['user'],
      });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const updatePostDto = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      postRepository.findById.mockResolvedValue(mockPost);
      postRepository.update.mockResolvedValue({
        ...mockPost,
        ...updatePostDto
      });

      const result = await postService.updatePost('1', updatePostDto);

      expect(postRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['user'],
      });
      expect(postRepository.update).toHaveBeenCalledWith('1', updatePostDto);
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findById.mockResolvedValue(null);

      await expect(postService.updatePost('1', { title: 'Updated Title' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePost', () => {
    it('should delete an existing post', async () => {
      postRepository.findById.mockResolvedValue(mockPost);
      postRepository.delete.mockResolvedValue(undefined);

      await postService.deletePost('1');

      expect(postRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['user'],
      });
      expect(postRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findById.mockResolvedValue(null);

      await expect(postService.deletePost('1')).rejects.toThrow(NotFoundException);
      expect(postRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findPostsByUserId', () => {
    it('should return paginated posts for a user', async () => {
      const query = {
        page: 1,
        pageSize: 10,
      };

      const posts = [mockPost];
      const totalCount = 1;
      const userId = 'user1';

      postRepository.findByUserId.mockResolvedValue([posts, totalCount]);

      const result = await postService.findPostsByUserId(userId, query as PostQueryDto);

      expect(postRepository.findByUserId).toHaveBeenCalledWith(userId, query, {
        relations: ['user']
      });
      expect(result).toEqual({
        data: posts,
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
  });

  describe('publishPost', () => {
    it('should publish a post', async () => {
      postRepository.findById.mockResolvedValue(mockPost);
      postRepository.update.mockResolvedValue({
        ...mockPost,
        published: true
      });

      const result = await postService.publishPost('1');

      expect(postRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['user'],
      });
      expect(postRepository.update).toHaveBeenCalledWith('1', { published: true });
      expect(result.published).toBe(true);
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findById.mockResolvedValue(null);

      await expect(postService.publishPost('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unpublishPost', () => {
    it('should unpublish a post', async () => {
      postRepository.findById.mockResolvedValue(mockPost);
      postRepository.update.mockResolvedValue({
        ...mockPost,
        published: false
      });

      const result = await postService.unpublishPost('1');

      expect(postRepository.findById).toHaveBeenCalledWith('1', {
        relations: ['user'],
      });
      expect(postRepository.update).toHaveBeenCalledWith('1', { published: false });
      expect(result.published).toBe(false);
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepository.findById.mockResolvedValue(null);

      await expect(postService.unpublishPost('1')).rejects.toThrow(NotFoundException);
    });
  });
});
