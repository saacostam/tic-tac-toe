export enum IEventType {
  GamesChanged = 'GAMES_CHANGED',
  UserGameChanged = 'USER_GAME_CHANGED',
  UserGameRemoved = 'USER_GAME_REMOVED',
  UserId = 'USER_ID',
}

export interface IEventAdapter {
  broadcast(args: IEventAdapterPayload['BroadcastIn']): Promise<void>;
  publish(args: IEventAdapterPayload['PublishIn']): Promise<void>;
}

export interface IEventAdapterPayload {
  PublishIn: {
    id: string;
    event: IEventType;
    message: string;
  };
  BroadcastIn: {
    event: IEventType;
  };
}
