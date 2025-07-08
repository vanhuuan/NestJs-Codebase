import {
  Controller,
  Post,
  Body,
  Inject,
  UseFilters,
  UseGuards,
  Request,
  HttpCode,
  Headers
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PaymentServicePort } from '../../application/ports/in/payment-service.port';

@ApiTags('payment')
@Controller('payment')
@UseFilters(HttpExceptionFilter)
export class PaymentController {
  constructor(
    @Inject('PaymentServicePort')
    private readonly paymentService: PaymentServicePort
  ) { }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Create a checkout session for subscription purchase' })
  @ApiCreatedResponse({
    description: 'Checkout session created successfully',
    type: CheckoutSessionResponseDto
  })
  createCheckoutSession(
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
    @Request() req: any
  ): Promise<CheckoutSessionResponseDto> {
    return this.paymentService.createCheckoutSession(
      req.user.id,
      createCheckoutSessionDto.plan
    );
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiOkResponse({
    description: 'Webhook event handled successfully',
  })
  async handleWebhook(
    @Request() req: any,
    @Headers('stripe-signature') signature: string
  ): Promise<any> {
    return this.paymentService.handleWebhookEvent(req, signature);
  }
}
