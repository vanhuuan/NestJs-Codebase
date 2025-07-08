import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Subscription } from '../../application/domain/entities/subscription.entity';
import { SubscriptionRepositoryPort } from '../../application/ports/out/subscription-repository.port';
import { BaseRepository } from '../../../common/repository/base-repository';

@Injectable()
export class SubscriptionRepository extends BaseRepository<Subscription> implements SubscriptionRepositoryPort {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {
    super(subscriptionRepository);
  }

  withTransaction(manager: EntityManager): SubscriptionRepository {
    return new SubscriptionRepository(manager.getRepository(Subscription));
  }
}