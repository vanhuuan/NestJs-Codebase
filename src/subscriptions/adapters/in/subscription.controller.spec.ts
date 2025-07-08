import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionServicePort } from '../../application/ports/in/subscription-service.port';
import { MockSubscriptionService } from '../../application/ports/in/mocks/subscription-service.mock';
import { SubscriptionPlanDto } from './dto/subscription-plan.dto';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let subscriptionService: jest.Mocked<SubscriptionServicePort>;

  const mockSubscriptionPlans: SubscriptionPlanDto[] = [
    {
      plan: 'MONTHLY',
      name: 'Gói Hằng Tháng',
      priceId: 'price_1Rbe2bQio7GlybOe9rQGe4qx',
      amount: 20000,
      currency: 'VND',
    },
    {
      plan: 'YEARLY',
      name: 'Gói Hằng Năm',
      priceId: 'price_1Rbe3JQio7GlybOezRq1Ziek',
      amount: 150000,
      currency: 'VND',
    },
  ];

  beforeEach(async () => {
    const mockService = new MockSubscriptionService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: 'SubscriptionServicePort',
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    subscriptionService = module.get<SubscriptionServicePort>(
      'SubscriptionServicePort',
    ) as jest.Mocked<SubscriptionServicePort>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getSubscriptionPlans', () => {
    it('should return all subscription plans', async () => {
      subscriptionService.getSubscriptionPlans.mockResolvedValue(mockSubscriptionPlans);

      const result = await controller.getSubscriptionPlans();

      expect(result).toBe(mockSubscriptionPlans);
      expect(subscriptionService.getSubscriptionPlans).toHaveBeenCalled();
    });
  });
});
