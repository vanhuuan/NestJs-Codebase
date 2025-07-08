import { SubscriptionRepositoryPort } from '../subscription-repository.port';
import { Subscription } from '../../../domain/entities/subscription.entity';
import { MockBaseRepository } from '../../../../../common/repository/mocks/base-repository.mock';
import { EntityManager } from 'typeorm';

export class MockSubscriptionRepository extends MockBaseRepository<Subscription> implements SubscriptionRepositoryPort {
  withTransaction = jest.fn((manager: EntityManager): SubscriptionRepositoryPort => {
    return this;
  })
}
