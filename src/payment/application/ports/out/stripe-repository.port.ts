export interface StripeRepositoryPort {
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionResponse>;
  createCustomer(userId: string, fullName: string, email: string): Promise<string>;
  constructEvent(req: any, signature: string): Promise<any>;
  getSessionIdFromCompletedEvent(event: any): string;
}

export class CreateCheckoutSessionParams {
  userId: string;
  customerId: string;
  paymentMethodTypes: string[];
  lineItems: StripeLineItem[];
  mode: string;
  metadata?: Record<string, string>;
}

export class CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export class StripeLineItem {
  priceId: string;
  quantity: number;
}