import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from '../../../../users/application/domain/entities/user.entity';
import { SubscriptionPlan, SubscriptionStatus } from './../../../../common/enums/subscription.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity('subscriptions')
export class Subscription {
  @ApiProperty({
    description: 'Subscription unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User who owns this subscription',
    type: () => User
  })
  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'ID of the user who owns this subscription',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'Subscription plan type',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
    default: SubscriptionPlan.MONTHLY
  })
  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.MONTHLY
  })
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2023-12-31T23:59:59.999Z'
  })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiProperty({
    description: 'Current status of the subscription',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    default: SubscriptionStatus.PENDING
  })
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Subscription amount',
    example: 9.99
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Stripe checkout session ID',
    example: 'cs_test_a1b2c3d4e5f6g7h8i9j0'
  })
  @Column({ unique: true })
  @Index('idx_stripe_session_id')
  stripeSessionId: string;

  @ApiProperty({
    description: 'Stripe subscription ID',
    example: 'sub_1234567890',
    nullable: true
  })
  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1234567890',
    nullable: true
  })
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @ApiProperty({
    description: 'Reason for subscription failure, if any',
    example: 'Card declined',
    nullable: true
  })
  @Column({ nullable: true })
  failureReason: string;

  @ApiProperty({
    description: 'Date when subscription was created',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when subscription was last updated',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Whether the subscription is expired',
    example: false
  })
  @Expose()
  get isExpired(): boolean {
    return this.endDate <= new Date();
  }

  @ApiProperty({
    description: 'Whether the subscription is valid (active and not expired)',
    example: true
  })
  @Expose()
  get isValid(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && !this.isExpired;
  }
}
