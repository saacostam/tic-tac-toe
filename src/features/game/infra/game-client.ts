import type { IGame, IGameClient, IGameClientPayload } from "../domain";

const BASE_HTTP_URL = "http://localhost:8000";

export class GameClient implements IGameClient {
	async createGame(args: IGameClientPayload["CreateGameReq"]): Promise<void> {
		const url = new URL(`/${args.userId}/games`, BASE_HTTP_URL);
		await fetch(url.toString(), { method: "POST" });
	}

	async queryGames(): Promise<IGame[]> {
		const url = new URL("/games", BASE_HTTP_URL);
		const resp = await fetch(url.toString());
		const data: null | Array<{
			ID: string;
			Players: Array<string>;
			Turns: [];
		}> = await resp.json();

		if (data === null) return [];

		return data.map((entry) => ({
			id: entry.ID,
			userIds: entry.Players,
		}));
	}

	async queryUserGame(
		args: IGameClientPayload["QueryUserGameReq"],
	): Promise<IGame | null> {
		const url = new URL(`/${args.userId}/games`, BASE_HTTP_URL);
		const resp = await fetch(url.toString());

		const data: null | {
			ID: string;
			Players: Array<string>;
			Turns: [];
		} = await resp.json();

		if (data === null) return null;

		return {
			id: data.ID,
			userIds: data.Players,
		};
	}
}
