import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanDto {
  @ApiProperty({
    description: 'Mã gói đăng ký',
    example: 'MONTHLY'
  })
  plan: string;

  @ApiProperty({
    description: 'Tên gói đăng ký',
    example: 'Gói Hằng Tháng'
  })
  name: string;

  @ApiProperty({
    description: 'ID giá của Stripe',
    example: 'price_1Rbe2bQio7GlybOe9rQGe4qx'
  })
  priceId: string;

  @ApiProperty({
    description: 'Giá gói đăng ký',
    example: 20000
  })
  amount: number;

  @ApiProperty({
    description: 'Đơn vị tiền tệ',
    example: 'VND'
  })
  currency: string;
}
