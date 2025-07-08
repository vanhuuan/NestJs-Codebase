import { Post } from '../../domain/entities/post.entity';
import { PostQueryDto } from '../../../adapters/in/dto/post-query.dto';
import { EntityManager, FindOneOptions } from 'typeorm';
import { BaseRepositoryPort } from '../../../../common/repository/base-repository.port';

export interface PostRepositoryPort extends BaseRepositoryPort<Post> {
  findAll(query: PostQueryDto, options?: FindOneOptions<Post>): Promise<[Post[], number]>;
  findByUserId(userId: string, query: PostQueryDto, options?: FindOneOptions<Post>): Promise<[Post[], number]>;
  withTransaction(manager: EntityManager): PostRepositoryPort;
}