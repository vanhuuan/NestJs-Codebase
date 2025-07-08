import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostServicePort } from '../../application/ports/in/post-service.port';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { Post } from '../../application/domain/entities/post.entity';
import { PaginatedResponseDto } from '../../../common/dto/pagination-response.dto';
import { MockPostService } from '../../application/ports/in/mocks/post-service.mock';

describe('PostController', () => {
  let postController: PostController;
  let postService: jest.Mocked<PostServicePort>;

  const mockUser = { 
    id: '1', 
    fullName: 'John Doe',
    hasActiveSubscription: jest.fn().mockReturnValue(true)
  };

  const mockPost: Post = {
    id: '1',
    title: 'Test Post',
    content: 'This is a test post content',
    published: true,
    userId: '1',
    user: mockUser as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse: PaginatedResponseDto<Post> = {
    data: [mockPost],
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
    const mockPostService = new MockPostService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: 'PostServicePort',
          useValue: mockPostService,
        },
      ],
    }).compile();

    postController = module.get<PostController>(PostController);
    postService = module.get<PostServicePort>('PostServicePort') as jest.Mocked<PostServicePort>;
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const createPostDto: CreatePostDto = {
        title: mockPost.title,
        content: mockPost.content,
        userId: mockPost.userId,
      };

      const req = { user: { id: mockPost.userId } };

      postService.createPost.mockResolvedValue(mockPost);

      const result = await postController.createPost(createPostDto, req);

      expect(result).toBe(mockPost);
      expect(postService.createPost).toHaveBeenCalledWith({
        ...createPostDto,
        userId: mockPost.userId
      });
    });
  });

  describe('findAllPosts', () => {
    it('should return paginated posts', async () => {
      const query = {
        page: 1,
        pageSize: 10,
        searchKey: 'test',
      };

      postService.findAllPosts.mockResolvedValue(mockPaginatedResponse);

      const result = await postController.findAllPosts(query as PostQueryDto);

      expect(result).toBe(mockPaginatedResponse);
      expect(postService.findAllPosts).toHaveBeenCalledWith(query);
    });
  });

  describe('findPostById', () => {
    it('should return a post by id', async () => {
      postService.findPostById.mockResolvedValue(mockPost);

      const result = await postController.findPostById('1');

      expect(result).toBe(mockPost);
      expect(postService.findPostById).toHaveBeenCalledWith('1');
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
      };
      const updatedPost = { ...mockPost, title: 'Updated Title' };

      postService.updatePost.mockResolvedValue(updatedPost);

      const result = await postController.updatePost('1', updatePostDto);

      expect(result).toBe(updatedPost);
      expect(postService.updatePost).toHaveBeenCalledWith('1', updatePostDto);
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      postService.deletePost.mockResolvedValue(undefined);

      await postController.deletePost('1');

      expect(postService.deletePost).toHaveBeenCalledWith('1');
    });
  });

  describe('findPostsByUserId', () => {
    it('should return posts for a specific user', async () => {
      const query = {
        page: 1,
        pageSize: 10,
      };

      postService.findPostsByUserId.mockResolvedValue(mockPaginatedResponse);

      const result = await postController.findPostsByUserId('1', query as PostQueryDto);

      expect(result).toBe(mockPaginatedResponse);
      expect(postService.findPostsByUserId).toHaveBeenCalledWith('1', query);
    });
  });

  describe('publishPost', () => {
    it('should publish a post successfully', async () => {
      const publishedPost = { ...mockPost, published: true };

      postService.publishPost.mockResolvedValue(publishedPost);

      const result = await postController.publishPost('1');

      expect(result).toBe(publishedPost);
      expect(postService.publishPost).toHaveBeenCalledWith('1');
    });
  });

  describe('unpublishPost', () => {
    it('should unpublish a post successfully', async () => {
      const unpublishedPost = { ...mockPost, published: false };

      postService.unpublishPost.mockResolvedValue(unpublishedPost);

      const result = await postController.unpublishPost('1');

      expect(result).toBe(unpublishedPost);
      expect(postService.unpublishPost).toHaveBeenCalledWith('1');
    });
  });
});
