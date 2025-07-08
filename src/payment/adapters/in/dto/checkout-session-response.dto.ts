import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty({
    description: 'URL to redirect the user to for checkout',
    example: 'https://checkout.stripe.com/c/pay/cs_test_xxx'
  })
  checkoutUrl: string;
}
