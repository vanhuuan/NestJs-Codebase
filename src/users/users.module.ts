import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './application/domain/entities/user.entity';
import { UserController } from './adapters/in/user.controller';
import { UserService } from './application/domain/services/user.service';
import { UserRepository } from './adapters/out/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    {
      provide: 'UserRepositoryPort',
      useClass: UserRepository,
    },
    {
      provide: 'UserServicePort',
      useClass: UserService,
    },
  ],
  exports: ['UserRepositoryPort', 'UserServicePort'],
})
export class UsersModule {}