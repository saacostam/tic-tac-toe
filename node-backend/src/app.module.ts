import { Module } from '@nestjs/common';
import { UserModule } from './features/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot(), UserModule],
})
export class AppModule {}
