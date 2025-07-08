import { User } from '../../domain/entities/user.entity';
import { UserQueryDto } from '../../../adapters/in/dto/user-query.dto';
import { BaseRepositoryPort } from '../../../../common/repository/base-repository.port';
import { EntityManager, FindOneOptions } from 'typeorm';

export interface UserRepositoryPort extends BaseRepositoryPort<User> {
  findByEmail(email: string, options?: FindOneOptions<User>): Promise<User | null>;
  findAll(query: UserQueryDto, options?: FindOneOptions<User>): Promise<[User[], number]>;
  withTransaction(manager: EntityManager): UserRepositoryPort;
}