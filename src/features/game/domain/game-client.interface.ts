import type { IGame } from "./game";

export interface IGameClient {
	createGame(args: IGameClientPayload["CreateGameReq"]): Promise<void>;
	joinGame(args: IGameClientPayload["JoinGameReq"]): Promise<void>;
	queryGames(): Promise<IGame[]>;
	queryUserGame(
		args: IGameClientPayload["QueryUserGameReq"],
	): Promise<IGame | null>;
}

export interface IGameClientPayload {
	CreateGameReq: {
		userId: string;
	};
	JoinGameReq: {
		gameId: string;
		userId: string;
	};
	QueryUserGameReq: {
		userId: string;
	};
}
