import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SubscriptionServicePort } from '../../ports/in/subscription-service.port';
import { SubscriptionPlanDto } from '../../../adapters/in/dto/subscription-plan.dto';
import * as fs from 'fs';
import * as path from 'path';
import { SubscriptionPlan } from './../../../../common/enums/subscription.enum';

@Injectable()
export class SubscriptionService implements SubscriptionServicePort {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly plansFilePath = path.join(process.cwd(), 'config', 'subscription-plans.json');

  constructor() { }

  async getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
    try {
      const plansData = fs.readFileSync(this.plansFilePath, 'utf8');
      return JSON.parse(plansData) as SubscriptionPlanDto[];
    } catch (error) {
      this.logger.error('Error reading subscription plans:', error);
      return [];
    }
  }

  async getSubscriptionPlanByName(planName: string): Promise<SubscriptionPlanDto> {
    const plans = await this.getSubscriptionPlans();
    const selectedPlan = plans.find(p => p.plan === planName);
    if (!selectedPlan) {
      throw new BadRequestException(`Subscription plan '${planName}' not found`);
    }
    return selectedPlan;
  };

  public static calculateEndDate(plan: string): Date {
    let endDate = new Date();

    switch (this.parseSubscriptionPlan(plan)) {
      case SubscriptionPlan.DAILY:
        endDate.setDate(endDate.getDate() + 1);
        break;
      case SubscriptionPlan.MONTHLY:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case SubscriptionPlan.QUARTERLY:
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case SubscriptionPlan.YEARLY:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        throw new BadRequestException(`Invalid subscription plan: ${plan}`);
    }

    return endDate;
  }

  public static parseSubscriptionPlan(input: string): SubscriptionPlan {
    const normalized = input?.toLowerCase() as SubscriptionPlan;

    if (!Object.values(SubscriptionPlan).includes(normalized)) {
      throw new BadRequestException(`Invalid subscription plan: ${input}`);
    }

    return normalized;
  }
}