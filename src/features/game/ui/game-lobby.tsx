import { Button, Card, Flex, Grid, Group, Text } from "@mantine/core";
import { useAdapters } from "@/shared/adapters/core/app";
import { EmptyQuery, QueryError, SuspenseLoader } from "@/shared/components";
import { getErrorCopy } from "@/shared/errors/domain";
import { useMutationCreateGame, useQueryGames } from "../app";

export interface GameLobbyProps {
	userId: string;
}

export function GameLobby({ userId }: GameLobbyProps) {
	const { notificationAdapter } = useAdapters();

	const gamesQuery = useQueryGames();
	const games = gamesQuery.useQuery();

	const createGame = useMutationCreateGame();

	const onClickCreateGame = () => {
		createGame.mutate(
			{
				userId,
			},
			{
				onError: (e) => {
					notificationAdapter.notify({
						type: "error",
						msg: getErrorCopy(e, "We couldn't create the game"),
					});
				},
				onSuccess: () => {
					notificationAdapter.notify({
						type: "success",
						msg: "Game Created",
					});
				},
			},
		);
	};

	return (
		<Flex direction="column" gap="md">
			<Group align="center" justify="space-between">
				<Text fw="bold" size="xl">
					🌐 Game Lobby
				</Text>
				<Button
					onClick={onClickCreateGame}
					loading={createGame.isPending || games.isLoading}
				>
					Create Game
				</Button>
			</Group>
			{games.isError && (
				<QueryError
					msg="We couldn&apos;t load the available games"
					retry={{ onClick: games.refetch, isPending: games.isLoading }}
				/>
			)}
			{games.isLoading && <SuspenseLoader style={{ height: "8rem" }} />}
			{games.isSuccess && (
				<Card withBorder>
					{games.data.length <= 0 ? (
						<EmptyQuery
							title="No Rooms Available!"
							description="Create a room or wait for one to appear"
						/>
					) : (
						<Grid>
							{games.data.map((room) => (
								<Grid.Col key={room.id} span={{ base: 12, md: 6 }}>
									<Card withBorder w="full">
										<Text fw="bold" size="lg">
											{room.id.slice(0, 10)}
										</Text>
										<Text size="sm">{room.userIds.length}/2 Players</Text>
									</Card>
								</Grid.Col>
							))}
						</Grid>
					)}
				</Card>
			)}
		</Flex>
	);
}
