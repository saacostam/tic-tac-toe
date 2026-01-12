import type { IGame } from "./game";

export interface IGameClient {
	createGame(args: IGameClientPayload["CreateGameReq"]): Promise<void>;
	queryGames(): Promise<IGame[]>;
	queryUserGame(
		args: IGameClientPayload["QueryUserGameReq"],
	): Promise<IGame | null>;
}

export interface IGameClientPayload {
	CreateGameReq: {
		userId: string;
	};
	QueryUserGameReq: {
		userId: string;
	};
}
