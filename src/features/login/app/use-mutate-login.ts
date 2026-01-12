import { MutationKeys, useMetaMutation } from "@/shared/async-state";
import { useClients } from "@/shared/clients/app";

export function useMutateLogin() {
	const { loginClient } = useClients();

	return useMetaMutation({
		mutationKey: [MutationKeys.LOGIN],
		mutationFn: loginClient.login.bind(loginClient),
	});
}
