import { useCallback, useMemo } from "react";
import type { IErrorMonitoringAdapter } from "../../domain";

export function useMockErrorMonitoringAdapter(): IErrorMonitoringAdapter {
	const report: IErrorMonitoringAdapter["report"] = useCallback(() => {
		// Do nothing
	}, []);

	return useMemo(
		() => ({
			report,
		}),
		[report],
	);
}
