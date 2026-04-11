import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain';
import { InMemoryUserRepository } from './infra';
import { UserController } from './presentation';
import { UserUseCases } from './app';

@Module({
  controllers: [UserController],
  providers: [
    UserUseCases,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
