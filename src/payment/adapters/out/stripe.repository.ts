import { Injectable, Logger } from '@nestjs/common';
import { CreateCheckoutSessionParams, CreateCheckoutSessionResponse, StripeRepositoryPort } from '../../application/ports/out/stripe-repository.port';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { StripeException } from '../../../common/exceptions/stripe.exception';

@Injectable()
export class StripeRepository implements StripeRepositoryPort {
  private readonly logger = new Logger(StripeRepository.name);
  private readonly stripe: Stripe;
  constructor(
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');
    if (!stripeSecretKey) {
      throw new StripeException('Stripe secret key is not configured');
    }

    this.logger.log(`Initializing Stripe with API key: ${stripeSecretKey.substring(0, 8)}...`);
    try {
      this.stripe = new Stripe(stripeSecretKey);
      this.logger.log('Stripe initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Stripe: ${error.message}`, error.stack);
      throw new StripeException(`Failed to initialize Stripe: ${error.message}`);
    }
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionResponse> {
    try {
      this.logger.log(`Creating checkout session with price ID: ${params.lineItems[0].priceId}`);

      const session = await this.stripe.checkout.sessions.create({
        customer: params.customerId,
        payment_method_types: params.paymentMethodTypes,
        line_items: params.lineItems.map(item => ({
          price: item.priceId
          , quantity: item.quantity,
        })),
        mode: params.mode,
        success_url: this.configService.get('stripe.successUrl') + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: this.configService.get('stripe.cancelUrl'),
        metadata: params.metadata || {},
      } as Stripe.Checkout.SessionCreateParams);

      this.logger.log(`Created checkout session with ID: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url || '',
      } as CreateCheckoutSessionResponse
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`, error.stack);
      throw new StripeException(`Failed to create checkout session: ${error.message}`);
    }
  }

  async createCustomer(userId: string, fullName: string, email: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        name: fullName,
        email: email,
        metadata: {
          userId: userId,
        },
      });

      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`, error.stack);
      throw new StripeException(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  async constructEvent(req: any, signature: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        this.configService.get<string>('stripe.webhookSecret')!
      );
    } catch (error) {
      this.logger.error(`Failed to construct Stripe event: ${error.message}`, error.stack);
      throw new StripeException(`Failed to construct Stripe event: ${error.message}`);
    }
  }

  getSessionIdFromCompletedEvent(event: Stripe.Event): string {
    if (event.type !== 'checkout.session.completed') {
      throw new StripeException('Event is not a checkout session completed event');
    }

    const session = event.data.object as Stripe.Checkout.Session;
    return session.id;
  }
}