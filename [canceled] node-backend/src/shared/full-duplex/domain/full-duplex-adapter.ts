import WebSocket from 'ws';

export enum IFullDuplexEventType {
  GamesChanged = 'GAMES_CHANGED',
  UserGameChanged = 'USER_GAME_CHANGED',
  UserGameRemoved = 'USER_GAME_REMOVED',
  UserId = 'USER_ID',
}

export interface IFullDuplexAdapter {
  addClient(userId: string, client: WebSocket): Promise<void>;

  broadcast(args: IFullDuplexAdapterPayload['BroadcastIn']): Promise<void>;
  publish(args: IFullDuplexAdapterPayload['PublishIn']): Promise<void>;
}

export interface IFullDuplexAdapterPayload {
  PublishIn: {
    id: string;
    event: IFullDuplexEventType;
    message: string;
  };
  BroadcastIn: {
    event: IFullDuplexEventType;
  };
}
