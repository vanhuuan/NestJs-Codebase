import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostServicePort } from '../../../application/ports/in/post-service.port';
import { PostRepositoryPort } from '../../../application/ports/out/post-repository.port';
import { CreatePostDto } from '../../../adapters/in/dto/create-post.dto';
import { UpdatePostDto } from '../../../adapters/in/dto/update-post.dto';
import { Post } from '../entities/post.entity';
import { PaginatedResponseDto } from '../../../../common/dto/pagination-response.dto';
import { PostQueryDto } from '../../../adapters/in/dto/post-query.dto';

@Injectable()
export class PostService implements PostServicePort {
  constructor(
    @Inject('PostRepositoryPort') private readonly postRepository: PostRepositoryPort
  ) { }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    return this.postRepository.create(createPostDto);
  }

  async findAllPosts(query: PostQueryDto): Promise<PaginatedResponseDto<Post>> {
    const [posts, totalCount] = await this.postRepository.findAll(query, {
      relations: ['user'],
    });
    return new PaginatedResponseDto<Post>(
      posts,
      query.page ?? 1,
      query.pageSize ?? 10,
      totalCount,
    );
  }

  async findPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id, {
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    await this.findPostById(id);
    return this.postRepository.update(id, updatePostDto);
  }

  async deletePost(id: string): Promise<void> {
    await this.findPostById(id);
    await this.postRepository.delete(id);
  }

  async findPostsByUserId(userId: string, query: PostQueryDto): Promise<PaginatedResponseDto<Post>> {
    const [posts, totalCount] = await this.postRepository.findByUserId(userId, query, {
      relations: ['user'],
    });
    return new PaginatedResponseDto<Post>(
      posts,
      query.page ?? 1,
      query.pageSize ?? 10,
      totalCount,
    );
  }

  async publishPost(id: string): Promise<Post> {
    await this.findPostById(id);
    return this.postRepository.update(id, { published: true });
  }

  async unpublishPost(id: string): Promise<Post> {
    await this.findPostById(id);
    return this.postRepository.update(id, { published: false });
  }
}