import {
	type RenderHookOptions,
	type RenderOptions,
	render,
	renderHook,
} from "@testing-library/react";
import {
	type MockAdapters,
	MockAdaptersProvider,
	type MockClients,
	MockClientsProvider,
	TestProviders,
} from "./utils.setup";

/**
 * Shared wrapper factory for consistent provider hierarchy
 */
function createWrapper({
	adapters,
	initialEntries,
	clients,
}: {
	adapters?: MockAdapters;
	initialEntries?: string[];
	clients?: MockClients;
}) {
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<TestProviders initialEntries={initialEntries}>
				<MockClientsProvider mock={clients}>
					<MockAdaptersProvider mock={adapters}>
						{children}
					</MockAdaptersProvider>
				</MockClientsProvider>
			</TestProviders>
		);
	};
}

/**
 * Render a React component with all test providers.
 */
export function renderWithProviders(
	ui: React.ReactElement,
	options?: Omit<RenderOptions, "wrapper"> & {
		adapters?: MockAdapters;
		initialEntries?: string[];
		clients?: MockClients;
	},
) {
	const { adapters, initialEntries, clients, ...renderOptions } = options ?? {};

	return render(ui, {
		wrapper: createWrapper({ adapters, initialEntries, clients }),
		...renderOptions,
	});
}

/**
 * Render a React hook with all test providers.
 */
export function renderHookWithProviders<Result, Props>(
	callback: (props: Props) => Result,
	options?: Omit<RenderHookOptions<Props>, "wrapper"> & {
		adapters?: MockAdapters;
		initialEntries?: string[];
		clients?: MockClients;
	},
) {
	const { adapters, initialEntries, clients, ...renderOptions } = options ?? {};

	return renderHook(callback, {
		wrapper: createWrapper({ adapters, initialEntries, clients }),
		...renderOptions,
	});
}
