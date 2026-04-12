import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain';
import { InMemoryUserRepository } from './infra';
import { UserController } from './presentation';
import { UserUseCases } from './app';
import { FullDuplexModule } from 'src/shared/full-duplex/full-duplex.module';

@Module({
  controllers: [UserController],
  providers: [
    UserUseCases,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  imports: [FullDuplexModule],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
