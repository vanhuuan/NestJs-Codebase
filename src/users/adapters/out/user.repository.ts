import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, EntityManager } from 'typeorm';
import { User } from '../../application/domain/entities/user.entity';
import { UserRepositoryPort } from '../../application/ports/out/user-repository.port';
import { UserQueryDto } from '../in/dto/user-query.dto';
import { BaseRepository } from '../../../common/repository/base-repository';

@Injectable()
export class UserRepository extends BaseRepository<User> implements UserRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  withTransaction(manager: EntityManager): UserRepository {
    return new UserRepository(manager.getRepository(User));
  }

  async findByEmail(email: string, options?: FindOneOptions<User>): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      ...options
    });
  }

  async findAll(query: UserQueryDto, options?: FindOneOptions<User>): Promise<[User[], number]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (options?.relations) {
      const relations = Array.isArray(options.relations) ? options.relations : [options.relations];
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`user.${relation}`, relation);
      });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.searchKey) {
      queryBuilder.andWhere(
        '(user.email ILIKE :searchKey OR user.fullName ILIKE :searchKey)',
        { searchKey: `%${query.searchKey}%` }
      );
    }

    if (query.sortBy) {
      queryBuilder.orderBy(`user.${query.sortBy}`, query.sortDirection);
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    queryBuilder.skip(query.skip);
    queryBuilder.take(query.pageSize ?? 10);

    return queryBuilder.getManyAndCount();
  }
}