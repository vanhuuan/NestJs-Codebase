import { UserRepositoryPort } from '../user-repository.port';
import { User } from '../../../domain/entities/user.entity';
import { MockBaseRepository } from '../../../../../common/repository/mocks/base-repository.mock';
import { EntityManager } from 'typeorm';

export class MockUserRepository extends MockBaseRepository<User> implements UserRepositoryPort {
  findAll = jest.fn();
  findByEmail = jest.fn();
  withTransaction = jest.fn((manager: EntityManager): UserRepositoryPort => {
    return this;
  })
}