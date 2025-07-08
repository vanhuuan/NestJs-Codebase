import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../../users/application/domain/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('posts')
export class Post {
  @ApiProperty({
    description: 'Post unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Post title',
    example: 'My First Blog Post'
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Post content',
    example: 'This is the content of my first blog post...'
  })
  @Column('text')
  content: string;

  @ApiProperty({
    description: 'Whether the post is published',
    example: true,
    default: false
  })
  @Column({ default: false })
  published: boolean;

  @ApiProperty({
    description: 'Whether the post is premium content (requires subscription)',
    example: false,
    default: false
  })
  @Column({ default: false })
  isPremium?: boolean;

  @ApiProperty({
    description: 'Date when post was created',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when post was last updated',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Post author',
    type: () => User
  })
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'ID of post author',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Column()
  userId: string;
}