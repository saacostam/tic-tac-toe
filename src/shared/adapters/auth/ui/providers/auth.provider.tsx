import type { PropsWithChildren } from "react";
import { AuthGuard } from "../components";

export function AuthProvider({ children }: PropsWithChildren) {
	return <AuthGuard>{children}</AuthGuard>;
}
