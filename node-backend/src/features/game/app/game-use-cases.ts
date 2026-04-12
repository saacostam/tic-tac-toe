import { Inject, Injectable } from '@nestjs/common';
import { IGame, type IGameRepository } from 'src/features/game/domain';
import { type IFullDuplexAdapter } from 'src/shared/full-duplex/domain';

@Injectable()
export class GameUseCases {
  constructor(
    @Inject('GAME_REPOSITORY')
    private gameRepo: IGameRepository,
    @Inject('FULL_DUPLEX_ADAPTER')
    private comm: IFullDuplexAdapter,
  ) {}

  async queryUserGame(userId: string): Promise<{
    game: IGame | null;
  }> {
    const games = await this.gameRepo.getGamesByUserId(userId);

    if (games.length === 0) {
      return {
        game: null,
      };
    }

    // Assert existence because of length check
    return {
      game: games.at(-1)!,
    };
  }
}
