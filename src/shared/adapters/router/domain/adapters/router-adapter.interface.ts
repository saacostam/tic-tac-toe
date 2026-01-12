export interface IRouterAdapter {
	getBaseUrl(): string;
	getPathname(): string;
	useParams(): Record<string, string | undefined>;
	getUrlSearchParams(): URLSearchParams;
	push(route: string): Promise<void>;
	replace(route: string): Promise<void>;
	reset(): Promise<void>;
}
