import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './application/domain/entities/post.entity';
import { PostController } from './adapters/in/post.controller';
import { PostService } from './application/domain/services/post.service';
import { PostRepository } from './adapters/out/post.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UsersModule],
  controllers: [PostController],
  providers: [
    {
      provide: 'PostRepositoryPort',
      useClass: PostRepository,
    },
    {
      provide: 'PostServicePort',
      useClass: PostService,
    },
  ],
  exports: ['PostRepositoryPort', 'PostServicePort'],
})
export class PostsModule { }