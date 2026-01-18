import { useQueryClient } from "@tanstack/react-query";
import { MutationKeys, QueryKeys, useMetaMutation } from "@/shared/async-state";
import { useClients } from "@/shared/clients/app";

export function useMutationJoinGame() {
	const queryClient = useQueryClient();

	const { gameClient } = useClients();

	return useMetaMutation({
		mutationKey: [MutationKeys.JOIN_GAME],
		mutationFn: gameClient.joinGame.bind(gameClient),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.AVAILABLE_ROOMS],
			});

			queryClient.invalidateQueries({
				queryKey: [QueryKeys.USER_GAME],
			});
		},
	});
}
