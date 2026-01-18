import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense } from "react";
import { Outlet } from "react-router";
import { AdaptersProvider } from "@/shared/adapters/core/ui";
import { ClientsProvider } from "@/shared/clients/ui";
import { MainErrorBoundary } from "@/shared/errors/ui";
import { SuspenseLoader } from "./shared/components";

const ConnectionGuard = lazy(async () => {
	const { ConnectionGuard } = await import(
		"@/features/connection/ui/connection-guard"
	);

	return {
		default: ConnectionGuard,
	};
});

const queryClient = new QueryClient();

function App() {
	return (
		<MainErrorBoundary>
			<ColorSchemeScript defaultColorScheme="auto" />
			<MantineProvider
				defaultColorScheme="auto"
				theme={{
					primaryColor: "indigo",
					black: "#00032a",
					defaultRadius: "md",
				}}
			>
				<QueryClientProvider client={queryClient}>
					<AdaptersProvider>
						<ClientsProvider>
							<Suspense
								fallback={<SuspenseLoader style={{ height: "100vh" }} />}
							>
								<ConnectionGuard>
									<Outlet />
								</ConnectionGuard>
							</Suspense>
						</ClientsProvider>
					</AdaptersProvider>
					<ReactQueryDevtools buttonPosition="bottom-left" />
				</QueryClientProvider>
				<Notifications />
			</MantineProvider>
		</MainErrorBoundary>
	);
}

export default App;
