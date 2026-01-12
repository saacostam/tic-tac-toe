import { showNotification } from "@mantine/notifications";
import { useCallback, useMemo } from "react";
import type { IUuidAdapter } from "@/shared/adapters/uuid/domain";
import type { INotificationAdapter } from "../../domain";

export interface UseNotificationAdapterArgs {
	uuidAdapter: IUuidAdapter;
}

export function useNotificationAdapter({
	uuidAdapter,
}: UseNotificationAdapterArgs): INotificationAdapter {
	const notify: INotificationAdapter["notify"] = useCallback(
		(args) => {
			const msg = args.msg;
			const type = args.type;

			const title = (args.type ?? type === "error") ? "Error" : "Success";

			showNotification({
				id: uuidAdapter.gen(),
				message: msg,
				title,
				color: type === "error" ? "red" : "green",
				withCloseButton: true,
			});
		},
		[uuidAdapter.gen],
	);

	return useMemo(
		() => ({
			notify,
		}),
		[notify],
	);
}
