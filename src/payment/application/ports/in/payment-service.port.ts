import { CheckoutSessionResponseDto } from "../../../adapters/in/dto/checkout-session-response.dto";

export interface PaymentServicePort {
  createCheckoutSession(userId: string, plan: string): Promise<CheckoutSessionResponseDto>;
  handleWebhookEvent(req: any, signature: string): Promise<void>;
}