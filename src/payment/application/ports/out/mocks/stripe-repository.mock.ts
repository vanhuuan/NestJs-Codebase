import { StripeRepositoryPort } from "../stripe-repository.port";

export class MockStripeRepository implements StripeRepositoryPort {
  createCheckoutSession = jest.fn();
  createCustomer = jest.fn();
  constructEvent = jest.fn();
  getSessionIdFromCompletedEvent = jest.fn();
}