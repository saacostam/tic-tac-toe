import {
	type GenerateRouteAction,
	type INavigationAdapter,
	RouteName,
} from "../../domain";

export class NavigationAdapter implements INavigationAdapter {
	generateRoute(action: GenerateRouteAction): string {
		switch (action.name) {
			case RouteName.LANDING: {
				return "/";
			}
			case RouteName.HOME: {
				return "/app";
			}
		}
	}
}
