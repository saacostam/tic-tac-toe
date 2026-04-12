import { Module } from '@nestjs/common';
import { GameController } from './presentation';
import { GameUseCases } from './app';
import { InMemoryGameRepository } from './infra';
import { FullDuplexModule } from 'src/shared/full-duplex/full-duplex.module';

@Module({
  controllers: [GameController],
  providers: [
    GameUseCases,
    {
      provide: 'GAME_REPOSITORY',
      useClass: InMemoryGameRepository,
    },
  ],
  imports: [FullDuplexModule],
  exports: ['GAME_REPOSITORY'],
})
export class GameModule {}
