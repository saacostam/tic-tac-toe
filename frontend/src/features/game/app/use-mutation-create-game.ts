import { useQueryClient } from "@tanstack/react-query";
import { MutationKeys, QueryKeys, useMetaMutation } from "@/shared/async-state";
import { useClients } from "@/shared/clients/app";

export function useMutationCreateGame() {
	const queryClient = useQueryClient();

	const { gameClient } = useClients();

	return useMetaMutation({
		mutationKey: [MutationKeys.CREATE_GAME],
		mutationFn: gameClient.createGame.bind(gameClient),
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
