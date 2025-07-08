import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './adapters/in/subscription.controller';
import { SubscriptionService } from './application/domain/services/subscription.service';
import { Subscription } from './application/domain/entities/subscription.entity';
import { UsersModule } from '../users/users.module';
import { DataSource } from 'typeorm';
import { SubscriptionRepository } from './adapters/out/subscription.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    UsersModule
  ],
  controllers: [SubscriptionController],
  providers: [
    {
      provide: 'SubscriptionServicePort',
      useClass: SubscriptionService,
    },
    {
      provide: 'SubscriptionRepositoryPort',
      useClass: SubscriptionRepository,
    },
    {
      provide: 'DataSource',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [DataSource],
    },
  ],
  exports: ['SubscriptionServicePort', 'SubscriptionRepositoryPort'],
})
export class SubscriptionsModule { }
