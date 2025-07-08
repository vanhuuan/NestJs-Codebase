import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import stripeConfig from '../../config/stripe.config';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { PaymentController } from './adapters/in/payment.controller';
import { StripeRepository } from './adapters/out/stripe.repository';
import { DataSource } from 'typeorm';
import { PaymentService } from './application/domain/services/payment.service';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    UsersModule,
    SubscriptionsModule,
  ],
  controllers: [PaymentController],
  providers: [
    {
      provide: 'StripeRepositoryPort',
      useClass: StripeRepository,
    },
    {
      provide: 'PaymentServicePort',
      useClass: PaymentService,
    },
    {
      provide: 'DataSource',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [DataSource],
    },
  ],
  exports: ['StripeRepositoryPort'],
})
export class PaymentModule {}
