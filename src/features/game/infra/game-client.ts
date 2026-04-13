import { DomainError, DomainErrorType } from "@/shared/errors/domain";
import type {
	IGame,
	IGameClient,
	IGameClientPayload,
	WithTurns,
} from "../domain";

const BASE_HTTP_URL = "https://saacostam-api.onrender.com/tic-tac-toe/";

export class GameClient implements IGameClient {
	async createGame(args: IGameClientPayload["CreateGameReq"]): Promise<void> {
		const url = new URL(`games/userId/${args.userId}`, BASE_HTTP_URL);

		const res = await fetch(url.toString(), { method: "POST" });

		if (!res.ok) {
			let message = "Failed to create game";

			try {
				const data = await res.json();
				if (typeof data?.message === "string") {
					message = data.message;
				}
			} catch {
				// ignore parse errors
			}

			throw new DomainError({
				userMsg: message,
				msg: message,
				type: DomainErrorType.UNKNOWN,
			});
		}
	}

	async endGame(args: IGameClientPayload["EndGameReq"]): Promise<void> {
		const url = new URL(
			`games/${args.gameId}/userId/${args.userId}/end`,
			BASE_HTTP_URL,
		);

		const res = await fetch(url.toString(), { method: "POST" });

		if (!res.ok) {
			let message = "Failed to end game";

			try {
				const data = await res.json();
				if (typeof data?.message === "string") {
					message = data.message;
				}
			} catch {
				// ignore parse errors
			}

			throw new DomainError({
				userMsg: message,
				msg: message,
				type: DomainErrorType.UNKNOWN,
			});
		}
	}

	async joinGame(args: IGameClientPayload["JoinGameReq"]): Promise<void> {
		const url = new URL(
			`games/${args.gameId}/userId/${args.userId}/join`,
			BASE_HTTP_URL,
		);

		const res = await fetch(url.toString(), { method: "POST" });

		if (!res.ok) {
			let message = "Failed to join game";

			try {
				const data = await res.json();
				if (typeof data?.message === "string") {
					message = data.message;
				}
			} catch {
				// ignore parse errors
			}

			throw new DomainError({
				userMsg: message,
				msg: message,
				type: DomainErrorType.UNKNOWN,
			});
		}
	}

	async queryGames(): Promise<IGame[]> {
		const url = new URL("games", BASE_HTTP_URL);

		const res = await fetch(url.toString());

		if (!res.ok) {
			let message = "Failed to fetch games";

			try {
				const data = await res.json();
				if (typeof data?.message === "string") {
					message = data.message;
				}
			} catch {
				// ignore parse errors
			}

			throw new DomainError({
				userMsg: message,
				msg: message,
				type: DomainErrorType.UNKNOWN,
			});
		}

		if (res.status === 204) {
			return [];
		}

		return res.json();
	}

	async queryUserGame(
		args: IGameClientPayload["QueryUserGameReq"],
	): Promise<WithTurns<IGame> | null> {
		const url = new URL(`games/userId/${args.userId}`, BASE_HTTP_URL);
		const resp = await fetch(url.toString());

		if (!resp.ok) {
			let message = "Failed to fetch game";

			try {
				const data = await resp.json();
				if (typeof data?.message === "string") {
					message = data.message;
				}
			} catch {
				// ignore parse errors
			}

			throw new DomainError({
				userMsg: message,
				msg: message,
				type: DomainErrorType.UNKNOWN,
			});
		}

		// Some APIs return 204 No Content instead of null JSON
		if (resp.status === 204) {
			return null;
		}

		const { game } = await resp.json();

		return game;
	}

	async sendTurn(args: IGameClientPayload["SendTurnReq"]): Promise<void> {
		const url = new URL(
			`games/${args.gameId}/userId/${args.userId}/turn`,
			BASE_HTTP_URL,
		);

		const res = await fetch(url.toString(), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				y: args.y,
				x: args.x,
			}),
		});

		if (!res.ok) {
			let message = "Failed to send turn";

			try {
				const data = await res.json();
				if (typeof data?.error === "string") {
					message = data.error;
				}
			} catch {
				// ignore JSON parse errors
			}

			throw new DomainError({
				userMsg: message,
				msg: message,
				type: DomainErrorType.UNKNOWN,
			});
		}
	}
}
