/**
 * @description Subscription status enum
 * @enum {string}
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  PAYMENT_FAILED = 'payment_failed'
}

/**
 * @description Subscription plan types enum
 * @enum {string}
 */
export enum SubscriptionPlan {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}