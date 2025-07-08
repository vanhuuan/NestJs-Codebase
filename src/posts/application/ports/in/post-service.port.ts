import { PaginatedResponseDto } from '../../../../common/dto/pagination-response.dto';
import { Post } from '../../domain/entities/post.entity';
import { CreatePostDto } from '../../../adapters/in/dto/create-post.dto';
import { UpdatePostDto } from '../../../adapters/in/dto/update-post.dto';
import { PostQueryDto } from '../../../adapters/in/dto/post-query.dto';

export interface PostServicePort {
  createPost(createPostDto: CreatePostDto): Promise<Post>;
  findAllPosts(query: PostQueryDto): Promise<PaginatedResponseDto<Post>>;
  findPostById(id: string): Promise<Post>;
  updatePost(id: string, updatePostDto: UpdatePostDto): Promise<Post>;
  deletePost(id: string): Promise<void>;
  findPostsByUserId(userId: string, query: PostQueryDto): Promise<PaginatedResponseDto<Post>>;
  publishPost(id: string): Promise<Post>;
  unpublishPost(id: string): Promise<Post>;
}