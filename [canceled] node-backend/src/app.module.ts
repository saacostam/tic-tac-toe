import { Module } from '@nestjs/common';
import { UserModule } from './features/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameModule } from './features/game/game.module';

@Module({
  imports: [EventEmitterModule.forRoot(), GameModule, UserModule],
})
export class AppModule {}
