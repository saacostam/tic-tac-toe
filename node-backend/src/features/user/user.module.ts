import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain';
import { InMemoryUserRepository } from './infra';
import { UserController } from './presentation';
import { UserUseCases } from './app';
import { WsModule } from 'src/shared/events/events.module';

@Module({
  controllers: [UserController],
  providers: [
    UserUseCases,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  imports: [WsModule],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
