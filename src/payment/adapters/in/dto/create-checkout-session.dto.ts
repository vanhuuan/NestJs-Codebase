import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionPlan } from '../../../../common/enums/subscription.enum';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Subscription plan to purchase',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY
  })
  @IsNotEmpty()
  @IsEnum(SubscriptionPlan)
  plan: string;
}
