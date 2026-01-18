import { lazy, type PropsWithChildren, Suspense } from "react";
import { Route, Routes } from "react-router";
import { useAdapters } from "@/shared/adapters/core/app";
import { RouteName } from "@/shared/adapters/navigation/domain";
import { SuspenseLoader } from "@/shared/components";
import { AppLayout, LandingLayout } from "@/shared/layout/ui";

// Lazy imports
const ErrorScreen = lazy(() => import("@/shared/screens/error-screen"));
const HomeScreen = lazy(() => import("@/shared/screens/home-screen"));
const LandingScreen = lazy(() => import("@/shared/screens/landing-screen"));

export function NavigationProvider({ children }: PropsWithChildren) {
	const { navigationAdapter } = useAdapters();

	return (
		<Suspense fallback={<SuspenseLoader style={{ height: "100vh" }} />}>
			<Routes>
				<Route element={children}>
					<Route
						index
						element={
							<LandingLayout>
								<LandingScreen />
							</LandingLayout>
						}
					/>
					<Route path="app" element={<AppLayout>{children}</AppLayout>}>
						<Route element={<HomeScreen />} index />
					</Route>
				</Route>
				<Route
					path="*"
					element={
						<ErrorScreen
							resetHref={navigationAdapter.generateRoute({
								name: RouteName.LANDING,
							})}
						/>
					}
				/>
			</Routes>
		</Suspense>
	);
}
