import { SubscriptionServicePort } from '../subscription-service.port';

export class MockSubscriptionService implements SubscriptionServicePort {
  getSubscriptionPlans = jest.fn();
  getSubscriptionPlanByName = jest.fn();
}
