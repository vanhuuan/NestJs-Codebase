import { PaymentServicePort } from '../payment-service.port';
export class MockPaymentService implements PaymentServicePort {
  createCheckoutSession = jest.fn();
  handleWebhookEvent = jest.fn();
}