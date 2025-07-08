import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentServicePort } from '../../ports/in/payment-service.port';
import { CheckoutSessionResponseDto } from '../../../adapters/in/dto/checkout-session-response.dto';
import { UserRepositoryPort } from '../../../../users/application/ports/out/user-repository.port';
import { SubscriptionRepositoryPort } from '../../../../subscriptions/application/ports/out/subscription-repository.port';
import { User } from '../../../../users/application/domain/entities/user.entity';
import { StripeRepositoryPort } from '../../ports/out/stripe-repository.port';
import { SubscriptionServicePort } from '../../../../subscriptions/application/ports/in/subscription-service.port';
import { SubscriptionService } from '../../../../subscriptions/application/domain/services/subscription.service';
import { SubscriptionStatus } from '../../../../common/enums/subscription.enum';
import { StripeEvent, StripePaymentMethod, StripePaymentMode } from '../../../../common/enums/stripe.enum';

@Injectable()
export class PaymentService implements PaymentServicePort {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('SubscriptionRepositoryPort') private readonly subscriptionRepository: SubscriptionRepositoryPort,
    @Inject('SubscriptionServicePort') private readonly subscriptionService: SubscriptionServicePort,
    @Inject('StripeRepositoryPort') private readonly stripeRepository: StripeRepositoryPort,
    @Inject('UserRepositoryPort') private userRepository: UserRepositoryPort,
    @Inject('DataSource') private readonly dataSource: DataSource,
  ) { }

  async createCheckoutSession(userId: string, planName: string): Promise<CheckoutSessionResponseDto> {
    // TODO: ensure that user does not have an active or pending subscription before creating a new one
    return await this.dataSource.transaction(async (manager) => {
      const subsRepo = this.subscriptionRepository.withTransaction(manager);
      const userRepo = this.userRepository.withTransaction(manager);

      const selectedPlan = await this.subscriptionService.getSubscriptionPlanByName(planName);

      const user = await userRepo.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let stripeCustomerId = await this.createStripeCustomerIfNotExists(user, userRepo);

      const session = await this.stripeRepository.createCheckoutSession({
        userId,
        customerId: stripeCustomerId,
        paymentMethodTypes: [StripePaymentMethod.CARD],
        lineItems: [{
          priceId: selectedPlan.priceId,
          quantity: 1,
        }],
        mode: StripePaymentMode.PAYMENT,
        metadata: {
          userId,
          plan: planName
        }
      })

      // TODO: save sessionUrl in the database to allow users to return to the checkout later
      await subsRepo.create({
        userId,
        stripeSessionId: session.sessionId,
        plan: SubscriptionService.parseSubscriptionPlan(selectedPlan.plan),
        startDate: new Date(),
        endDate: SubscriptionService.calculateEndDate(selectedPlan.plan),
        status: SubscriptionStatus.PENDING,
        amount: selectedPlan.amount,
      });

      return {
        checkoutUrl: session.url!
      };
    });
  }

  async createStripeCustomerIfNotExists(user: User, userRepo: UserRepositoryPort): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customerId = await this.stripeRepository.createCustomer(user.id, user.fullName, user.email);
    user.stripeCustomerId = customerId;

    await userRepo.update(user.id, { stripeCustomerId: customerId });

    return customerId;
  }

  async handleWebhookEvent(req: any, signature: string): Promise<void> {
    const event = await this.stripeRepository.constructEvent(req, signature);

    switch (event.type) {
      case StripeEvent.CHECKOUT_SESSION_COMPLETED: {
        const sessionId = this.stripeRepository.getSessionIdFromCompletedEvent(event);

        await this.subscriptionRepository.updateOne(
          { stripeSessionId: sessionId },
          { status: SubscriptionStatus.ACTIVE }
        );

        break;
      }
    }
  }

  // TODO: Create cron job to handle subscription status updates in case of webhook failures
}