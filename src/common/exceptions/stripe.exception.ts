import { BadRequestException } from "@nestjs/common";

export class StripeException extends BadRequestException {
  constructor(message: string) {
    super(`Stripe Error: ${message}`);
  }
}