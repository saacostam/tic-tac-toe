import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import type { INotificationAdapterPayload } from "@/shared/adapters/notification/domain";
import { DomainError, DomainErrorType } from "@/shared/errors/domain";
import { renderWithProviders } from "@/tests";
import type { IGame, IGameClientPayload } from "../domain";
import { mockGame } from "../test";
import { Game } from "./game";

function createDeps(args: { auth: boolean }) {
	const notify = vi.fn();

	const createGame = vi.fn();
	const joinGame = vi.fn();
	const queryUserGame = vi.fn();
	const queryGames = vi.fn();

	const deps = {
		adapters: {
			sessionAdapter: {
				session: args.auth
					? {
							type: "authenticated" as const,
							userId: "test-userId",
							onClear: () => {},
						}
					: {
							type: "unauthenticated" as const,
						},
			},
			notificationAdapter: {
				notify,
			},
		},
		clients: {
			gameClient: {
				createGame,
				joinGame,
				queryUserGame,
				queryGames,
			},
		},
	};

	return {
		deps,
		notify,
		createGame,
		joinGame,
		queryUserGame,
		queryGames,
	};
}

const mockError = new DomainError({
	msg: "msg error",
	userMsg: "userMsg error",
	type: DomainErrorType.UNKNOWN,
});

describe("Game [Integration]", () => {
	describe("edge-cases", () => {
		it("should handle user-game query loading state", async () => {
			const { deps, queryUserGame } = createDeps({ auth: true });
			queryUserGame.mockImplementation(() => new Promise(() => {}));

			renderWithProviders(<Game />, deps);

			await waitFor(() => {
				expect(queryUserGame).toHaveBeenCalled();
				expect(screen.getByTestId("suspense-loader")).toBeDefined();
				expect(screen.queryByTestId("query-error")).toBeNull();
			});
		});

		it("should handle user-game query error", async () => {
			const { deps, queryUserGame } = createDeps({ auth: true });
			queryUserGame.mockRejectedValueOnce(mockError);

			renderWithProviders(<Game />, deps);

			await waitFor(() => {
				expect(queryUserGame).toHaveBeenCalled();
				expect(screen.getByTestId("query-error")).toBeDefined();
			});

			// Retry
			queryUserGame.mockReset();
			queryUserGame.mockResolvedValueOnce(null);

			const retryButton = screen.getByRole("button", { name: /retry/i });
			await userEvent.click(retryButton);
			expect(queryUserGame).toHaveBeenCalledOnce();
		});

		it("should not query if unauthenticated, and keep loading state", async () => {
			const { deps, queryUserGame } = createDeps({ auth: false });

			renderWithProviders(<Game />, deps);

			await waitFor(() => {
				expect(screen.getByTestId("suspense-loader")).toBeDefined();
				expect(screen.queryByTestId("query-error")).toBeNull();
				expect(queryUserGame).not.toHaveBeenCalled();
			});
		});
	});

	describe("routing to correct view", () => {
		describe("should redirect to lobby if user doesn't have a current game", () => {
			it("handle loading state", async () => {
				const { deps, createGame, queryUserGame, queryGames } = createDeps({
					auth: true,
				});

				queryUserGame.mockResolvedValue(null);
				queryGames.mockImplementation(() => new Promise(() => {}));

				renderWithProviders(<Game />, deps);

				// Render correct view
				await waitFor(() => {
					expect(screen.getByTestId("game-lobby")).toBeDefined();
					expect(screen.queryByTestId("query-error")).toBeNull();
					expect(screen.queryByTestId("suspense-loader")).toBeDefined();
				});

				// Disable create button
				const createGameButton = screen.getByRole("button", {
					name: "Create Game",
				});
				expect(createGameButton).toBeDisabled();
				await userEvent.click(createGameButton);
				expect(createGame).not.toHaveBeenCalled();
			});

			it("handle error state", async () => {
				const { deps, createGame, queryUserGame, queryGames } = createDeps({
					auth: true,
				});

				queryUserGame.mockResolvedValue(null);
				queryGames.mockRejectedValue(mockError);

				renderWithProviders(<Game />, deps);

				await waitFor(() => {
					expect(screen.getByTestId("game-lobby")).toBeDefined();
					expect(screen.queryByTestId("suspense-loader")).toBeNull();
					expect(screen.queryByTestId("query-error")).toBeDefined();
				});

				// Allow create button click
				const createGameButton = screen.getByRole("button", {
					name: "Create Game",
				});
				expect(createGameButton).not.toBeDisabled();
				await userEvent.click(createGameButton);

				const expectedCreateGamePayload: IGameClientPayload["CreateGameReq"] = {
					userId: "test-userId",
				};
				expect(createGame).toHaveBeenCalledExactlyOnceWith(
					expectedCreateGamePayload,
				);

				// Retry
				queryGames.mockReset();
				queryGames.mockResolvedValueOnce([]);

				const retryButton = screen.getByRole("button", { name: /retry/i });
				await userEvent.click(retryButton);
				expect(queryGames).toHaveBeenCalledOnce();
			});

			it("renders empty-query if there are 0 games", async () => {
				const { deps, createGame, queryUserGame, queryGames } = createDeps({
					auth: true,
				});

				queryUserGame.mockResolvedValue(null);
				queryGames.mockResolvedValue([]);

				renderWithProviders(<Game />, deps);

				await waitFor(() => {
					expect(screen.getByTestId("game-lobby")).toBeDefined();
					expect(screen.getByTestId("game-lobby-content")).toBeDefined();
					expect(screen.queryByTestId("suspense-loader")).toBeNull();
					expect(screen.queryByTestId("query-error")).toBeNull();

					const emptyQuery = screen.getByTestId("empty-query");
					expect(emptyQuery).toBeDefined();
					expect(
						within(emptyQuery).getByText("No Rooms Available!"),
					).toBeDefined();
					expect(
						within(emptyQuery).getByText(
							"Create a room or wait for one to appear",
						),
					).toBeDefined();
				});

				// Allow create button click
				const createGameButton = screen.getByRole("button", {
					name: "Create Game",
				});
				expect(createGameButton).not.toBeDisabled();
				await userEvent.click(createGameButton);

				const expectedCreateGamePayload: IGameClientPayload["CreateGameReq"] = {
					userId: "test-userId",
				};
				expect(createGame).toHaveBeenCalledExactlyOnceWith(
					expectedCreateGamePayload,
				);
			});

			it("renders games if more than 0", async () => {
				const {
					deps,
					createGame,
					joinGame,
					queryUserGame,
					queryGames,
					notify,
				} = createDeps({
					auth: true,
				});

				const games: IGame[] = [
					mockGame({
						id: "game-id-1",
						userIds: [],
					}),
					mockGame({
						id: "game-id-2",
						userIds: ["test-id"],
					}),
				];

				queryUserGame.mockResolvedValue(null);
				queryGames.mockResolvedValue(games);

				renderWithProviders(<Game />, deps);

				await waitFor(() => {
					expect(screen.getByTestId("game-lobby")).toBeDefined();
					expect(screen.getByTestId("game-lobby-content")).toBeDefined();
					expect(screen.queryByTestId("suspense-loader")).toBeNull();
					expect(screen.queryByTestId("query-error")).toBeNull();

					expect(screen.queryByTestId("empty-query")).toBeNull();
					expect(
						screen.getAllByTestId("game-lobby-room-item").length,
					).toBeGreaterThan(0);
				});

				// Elements
				const roomElements = screen.getAllByTestId("game-lobby-room-item");
				expect(roomElements.length).toBe(2);
				roomElements.forEach((el) => {
					expect(el).toBeInstanceOf(HTMLButtonElement);
					expect(el).not.toBeDisabled();
				});

				const firstRoom = roomElements[0];
				expect(within(firstRoom).getByText("0/2 Players")).toBeDefined();
				expect(within(firstRoom).getByText("game-id-1")).toBeDefined();

				const secondRoom = roomElements[1];
				expect(within(secondRoom).getByText("1/2 Players")).toBeDefined();
				expect(within(secondRoom).getByText("game-id-2")).toBeDefined();

				// Join Room First Room - Error
				const expectedJoinRoomPayload: IGameClientPayload["JoinGameReq"] = {
					gameId: "game-id-1",
					userId: "test-userId",
				};

				queryUserGame.mockReset();
				queryUserGame.mockResolvedValue(null);
				joinGame.mockRejectedValueOnce(mockError);

				await userEvent.click(firstRoom);
				expect(joinGame).toHaveBeenCalledExactlyOnceWith(
					expectedJoinRoomPayload,
				);
				await waitFor(() => {
					expect(queryUserGame).toHaveBeenCalledOnce();

					const expectedNotficationPayload: INotificationAdapterPayload["NotifyIn"] =
						{
							type: "error",
							msg: mockError.userMsg,
						};
					expect(notify).toHaveBeenCalledExactlyOnceWith(
						expectedNotficationPayload,
					);
				});

				// Join Room First Room - Success
				queryUserGame.mockReset();
				queryUserGame.mockResolvedValue(null);
				joinGame.mockReset();
				notify.mockReset();

				await userEvent.click(firstRoom);
				expect(joinGame).toHaveBeenCalledExactlyOnceWith(
					expectedJoinRoomPayload,
				);
				await waitFor(() => {
					expect(queryUserGame).toHaveBeenCalledOnce();

					const expectedNotficationPayload: INotificationAdapterPayload["NotifyIn"] =
						{
							type: "success",
							msg: "Game Joined!",
						};
					expect(notify).toHaveBeenCalledExactlyOnceWith(
						expectedNotficationPayload,
					);
				});

				// Allow create button click -
				const createGameButton = screen.getByRole("button", {
					name: "Create Game",
				});
				expect(createGameButton).not.toBeDisabled();

				const expectedCreateGamePayload: IGameClientPayload["CreateGameReq"] = {
					userId: "test-userId",
				};

				// Create - Error
				queryUserGame.mockReset();
				queryUserGame.mockResolvedValue(null);
				createGame.mockRejectedValueOnce(mockError);
				notify.mockReset();

				await userEvent.click(createGameButton);
				expect(createGame).toHaveBeenCalledExactlyOnceWith(
					expectedCreateGamePayload,
				);
				await waitFor(() => {
					expect(queryUserGame).toHaveBeenCalledOnce();

					const expectedNotficationPayload: INotificationAdapterPayload["NotifyIn"] =
						{
							type: "error",
							msg: mockError.userMsg,
						};
					expect(notify).toHaveBeenCalledExactlyOnceWith(
						expectedNotficationPayload,
					);
				});

				// Create - Success
				queryUserGame.mockReset();
				queryUserGame.mockResolvedValue(null);
				createGame.mockReset();
				notify.mockReset();

				await userEvent.click(createGameButton);
				expect(createGame).toHaveBeenCalledExactlyOnceWith(
					expectedCreateGamePayload,
				);
				await waitFor(() => {
					expect(queryUserGame).toHaveBeenCalledOnce();

					const expectedNotficationPayload: INotificationAdapterPayload["NotifyIn"] =
						{
							type: "success",
							msg: "Game Created!",
						};
					expect(notify).toHaveBeenCalledExactlyOnceWith(
						expectedNotficationPayload,
					);
				});
			});
		});
	});
});
