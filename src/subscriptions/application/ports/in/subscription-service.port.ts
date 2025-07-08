import { SubscriptionPlanDto } from '../../../adapters/in/dto/subscription-plan.dto';

export interface SubscriptionServicePort {
  getSubscriptionPlans(): Promise<SubscriptionPlanDto[]>;
  getSubscriptionPlanByName(planName: string): Promise<SubscriptionPlanDto>;
}
