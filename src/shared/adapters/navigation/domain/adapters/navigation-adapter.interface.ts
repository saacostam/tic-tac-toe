import type { RouteName } from "../entities";

export type GenerateRouteAction =
	| {
			name: RouteName.LANDING;
	  }
	| {
			name: RouteName.HOME;
	  };

export interface INavigationAdapter {
	generateRoute(action: GenerateRouteAction): string;
}
