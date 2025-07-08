import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../../../posts/application/domain/entities/post.entity';
import { Exclude, Expose } from 'class-transformer';
import { Subscription } from '../../../../subscriptions/application/domain/entities/subscription.entity';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @Column()
  fullName: string;

  @ApiHideProperty()
  @Column()
  @Exclude({ toPlainOnly: true }) // This excludes from serialization but keeps in DB queries
  password: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Stripe customer ID',
    example: 'cus_1234567890',
    nullable: true
  })
  @Column({ nullable: true })
  stripeCustomerId: string;

  @ApiProperty({
    description: 'Stripe payment method ID',
    example: 'pm_1234567890',
    nullable: true
  })
  @Column({ nullable: true })
  stripePaymentMethodId: string;

  @ApiProperty({
    description: 'Date when user was created',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when user was last updated',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({
    description: 'User posts',
    type: () => Post,
    isArray: true
  })
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @ApiProperty({
    description: 'User subscriptions',
    type: () => Subscription,
    isArray: true
  })
  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @ApiProperty({
    description: 'User roles',
    example: ['user', 'admin'],
    isArray: true,
    default: ['user']
  })
  @Column({ type: 'simple-array', default: 'user' })
  roles: string[];

  @Expose()
  @ApiProperty({
    description: 'Whether user has an active subscription',
    example: true
  })
  get hasActiveSubscription(): boolean {
    if (!this.subscriptions || this.subscriptions.length === 0) {
      return false;
    }

    return this.subscriptions.some(sub => sub.isValid);
  }
}