import { ITurn } from './turn-entity';

export enum IGameStatus {
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
}

export interface IGame {
  id: string;
  players: string[];
  turns: ITurn[];
  status: IGameStatus;
  winnerPlayerId: string | null;
}
