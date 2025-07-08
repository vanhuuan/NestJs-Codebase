import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, EntityManager } from 'typeorm';
import { Post } from '../../application/domain/entities/post.entity';
import { PostRepositoryPort } from '../../application/ports/out/post-repository.port';
import { PostQueryDto } from '../in/dto/post-query.dto';
import { BaseRepository } from '../../../common/repository/base-repository';

@Injectable()
export class PostRepository extends BaseRepository<Post> implements PostRepositoryPort {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {
    super(postRepository);
  }

  withTransaction(manager: EntityManager): PostRepository {
    return new PostRepository(manager.getRepository(Post));
  }

  async findAll(query: PostQueryDto, options?: FindOneOptions<Post>): Promise<[Post[], number]> {
    const queryBuilder = this.postRepository.createQueryBuilder('post');

    if (options?.relations) {
      const relations = Array.isArray(options.relations) ? options.relations : [options.relations];
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`post.${relation}`, relation);
      });
    } else {
      queryBuilder.leftJoinAndSelect('post.user', 'user');
    }

    if (query.published !== undefined) {
      queryBuilder.andWhere('post.published = :published', { published: query.published });
    }

    if (query.userId) {
      queryBuilder.andWhere('post.userId = :userId', { userId: query.userId });
    }

    if (query.searchKey) {
      queryBuilder.andWhere(
        '(post.title ILIKE :searchKey OR post.content ILIKE :searchKey)',
        { searchKey: `%${query.searchKey}%` }
      );
    }

    if (query.sortBy) {
      queryBuilder.orderBy(`post.${query.sortBy}`, query.sortDirection);
    } else {
      queryBuilder.orderBy('post.createdAt', 'DESC');
    }

    queryBuilder.skip(query.skip);
    queryBuilder.take(query.pageSize ?? 10);

    return queryBuilder.getManyAndCount();
  }

  async findByUserId(userId: string, query: PostQueryDto, options?: FindOneOptions<Post>): Promise<[Post[], number]> {
    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .where('post.userId = :userId', { userId });

    if (options?.relations) {
      const relations = Array.isArray(options.relations) ? options.relations : [options.relations];
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`post.${relation}`, relation);
      });
    } else {
      queryBuilder.leftJoinAndSelect('post.user', 'user');
    }

    if (query.published !== undefined) {
      queryBuilder.andWhere('post.published = :published', { published: query.published });
    }

    if (query.searchKey) {
      queryBuilder.andWhere(
        '(post.title ILIKE :searchKey OR post.content ILIKE :searchKey)',
        { searchKey: `%${query.searchKey}%` }
      );
    }

    if (query.sortBy) {
      queryBuilder.orderBy(`post.${query.sortBy}`, query.sortDirection);
    } else {
      queryBuilder.orderBy('post.createdAt', 'DESC');
    }

    queryBuilder.skip(query.skip);
    queryBuilder.take(query.pageSize ?? 10);

    return queryBuilder.getManyAndCount();
  }
}