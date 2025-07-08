import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentServicePort } from '../../application/ports/in/payment-service.port';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { StripeRepository } from '../out/stripe.repository';
import { ConfigService } from '@nestjs/config';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: jest.Mocked<PaymentServicePort>;
  beforeEach(async () => {
    // Create a mock payment service with jest mock functions
    const mockService = {
      createCheckoutSession: jest.fn(),
    };

    // Mock ConfigService for StripeRepository
    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'stripe.secretKey') return 'sk_test_123456';
        if (key === 'stripe.successUrl') return 'https://example.com/success';
        if (key === 'stripe.cancelUrl') return 'https://example.com/cancel';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'StripeRepositoryPort',
          useClass: StripeRepository,
        },
        {
          provide: 'PaymentServicePort',
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentServicePort>(
      'PaymentServicePort',
    ) as jest.Mocked<PaymentServicePort>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      // Mock data
      const userId = 'user-123';
      const createCheckoutSessionDto: CreateCheckoutSessionDto = {
        plan: 'MONTHLY'
      };
      const mockResponse: CheckoutSessionResponseDto = {
        checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_xxx'
      };

      // Mock request object with user
      const mockRequest = {
        user: {
          id: userId
        }
      };

      // Setup service mock
      paymentService.createCheckoutSession.mockResolvedValue(mockResponse);

      // Call the controller method
      const result = await controller.createCheckoutSession(createCheckoutSessionDto, mockRequest);      // Assert the response
      expect(result).toEqual(mockResponse);
      expect(paymentService.createCheckoutSession).toHaveBeenCalledWith(
        userId,
        createCheckoutSessionDto.plan
      );
    });
  });
});
