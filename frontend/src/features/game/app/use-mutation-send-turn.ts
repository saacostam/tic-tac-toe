import { useQueryClient } from "@tanstack/react-query";
import { MutationKeys, QueryKeys, useMetaMutation } from "@/shared/async-state";
import { useClients } from "@/shared/clients/app";

export function useMutationSendTurn() {
	const queryClient = useQueryClient();

	const { gameClient } = useClients();

	return useMetaMutation({
		mutationKey: [MutationKeys.SEND_TURN],
		mutationFn: gameClient.sendTurn.bind(gameClient),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.USER_GAME],
			});
		},
	});
}
