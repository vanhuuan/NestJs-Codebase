import { PostRepositoryPort } from '../post-repository.port';
import { Post } from '../../../domain/entities/post.entity';
import { MockBaseRepository } from '../../../../../common/repository/mocks/base-repository.mock';
import { EntityManager } from 'typeorm';

export class MockPostRepository extends MockBaseRepository<Post> implements PostRepositoryPort {
  findAll = jest.fn();
  findByUserId = jest.fn();
  withTransaction = jest.fn((manager: EntityManager): PostRepositoryPort => {
    return this;
  })
}
