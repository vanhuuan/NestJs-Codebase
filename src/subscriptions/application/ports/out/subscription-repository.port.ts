import { Subscription } from '../../domain/entities/subscription.entity';
import { EntityManager } from 'typeorm';
import { BaseRepositoryPort } from '../../../../common/repository/base-repository.port';

export interface SubscriptionRepositoryPort extends BaseRepositoryPort<Subscription> {
  withTransaction(manager: EntityManager): SubscriptionRepositoryPort;
}