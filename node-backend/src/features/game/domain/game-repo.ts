import { IGame } from './game-entity';

export interface IGameRepository {
  createGame(userId: string): Promise<void>;
  getGameById(gameId: string): Promise<IGame | null>;
  getGamesByUserId(userId: string): Promise<IGame[]>;
  getOpenGames(): Promise<IGame[]>;
  updateGameById(gameId: string, game: IGame): Promise<void>;
  removeGame(gameId: string): Promise<void>;
}
