import type { PropsWithChildren } from "react";
import { SuspenseLoader } from "@/shared/components";
import { useConnectionGuard } from "../app";

export function ConnectionGuard({ children }: PropsWithChildren) {
	const status = useConnectionGuard();

	if (status === "success") return children;

	return <SuspenseLoader style={{ height: "100vh" }} />;
}
