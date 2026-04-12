import { IGame, IGameRepository, IGameStatus } from 'src/features/game/domain';
import { BaseDomainError, DomainErrorType } from 'src/shared/errors/domain';

export class InMemoryGameRepository implements IGameRepository {
  private games: IGame[] = [];

  async createGame(userId: string): Promise<void> {
    const game: IGame = {
      id: crypto.randomUUID(),
      players: [userId],
      turns: [],
      status: IGameStatus.STARTED,
      winnerPlayerId: null,
    };

    this.games.push(game);
  }

  async getGameById(gameId: string): Promise<IGame | null> {
    const game = this.games.find((g) => g.id === gameId);
    return game ?? null;
  }

  async getGamesByUserId(userId: string): Promise<IGame[]> {
    const gamesByUserId: IGame[] = [];

    for (const game of this.games) {
      if (game.players.includes(userId)) {
        gamesByUserId.push(game);
      }
    }

    return gamesByUserId;
  }

  async getOpenGames(): Promise<IGame[]> {
    const openGames: IGame[] = [];

    for (const game of this.games) {
      if (game.players.length < 2 && game.status === IGameStatus.STARTED) {
        openGames.push(game);
      }
    }

    return openGames;
  }

  async updateGameById(gameId: string, game: IGame): Promise<void> {
    const exists = this.games.find((g) => g.id === gameId);

    if (!exists) {
      throw new BaseDomainError({
        type: DomainErrorType.NOT_FOUND,
        userMessage: 'Game does not exist',
        message: `[InMemoryGameRepo.updateGameById] game with id ${gameId} not found`,
      });
    }

    this.games = this.games.map((g) => (g.id === exists.id ? game : g));
  }

  async removeGame(gameId: string): Promise<void> {
    this.games = this.games.filter((g) => g.id !== gameId);
  }
}
