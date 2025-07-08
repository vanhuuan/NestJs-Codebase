export default () => ({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret',
    successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/payment/success',
    cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/payment/cancel',
  },
});
