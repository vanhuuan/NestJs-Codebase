import {
  Controller,
  Get,
  Inject,
  UseFilters,
  UseGuards} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SubscriptionServicePort } from '../../application/ports/in/subscription-service.port';
import { SubscriptionPlanDto } from './dto/subscription-plan.dto';
import { RolesGuard } from './../../../common/guards/roles.guard';
import { Roles } from './../../../common/decorators/roles.decorator';
import { UserRole } from './../../../common/enums/roles.enum';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
export class SubscriptionController {
  constructor(
    @Inject('SubscriptionServicePort')
    private readonly subscriptionService: SubscriptionServicePort
  ) { }

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiOkResponse({
    description: 'Subscription plans retrieved successfully',
    type: [SubscriptionPlanDto]
  })
  getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
    return this.subscriptionService.getSubscriptionPlans();
  }
}
