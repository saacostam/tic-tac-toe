import { useMantineColorScheme } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import {
	type IPersistenceAdapter,
	IPersistenceAdapterKey,
} from "@/shared/adapters/persistence/domain";
import { type IThemeAdapter, IThemeVariant } from "../domain";

const KEY = IPersistenceAdapterKey.THEME;

function loadStoredTheme(
	persistence: IPersistenceAdapter,
): IThemeAdapter["theme"] {
	if (typeof window === "undefined") return IThemeVariant.LIGHT;
	const saved = persistence.get(KEY);
	return saved === IThemeVariant.LIGHT || saved === IThemeVariant.DARK
		? saved
		: IThemeVariant.DARK;
}

function storeTheme(args: {
	persistence: IPersistenceAdapter;
	theme: IThemeAdapter["theme"];
}) {
	const { persistence, theme } = args;

	try {
		persistence.set(KEY, theme);
	} catch {
		// continue
	}
}

export interface UseThemeAdapterImplArgs {
	persistenceAdapter: IPersistenceAdapter;
}

export function useThemeAdapterImpl({
	persistenceAdapter,
}: UseThemeAdapterImplArgs): IThemeAdapter {
	const { setColorScheme } = useMantineColorScheme();

	const [theme, setTheme] = useState<IThemeAdapter["theme"]>(
		loadStoredTheme(persistenceAdapter),
	);

	useEffect(() => {
		if (theme === IThemeVariant.DARK) {
			setColorScheme("dark");
		} else {
			setColorScheme("light");
		}
	}, [setColorScheme, theme]);

	useEffect(() => {
		storeTheme({
			theme,
			persistence: persistenceAdapter,
		});
	}, [persistenceAdapter, theme]);

	return useMemo(() => ({ theme, setTheme }), [theme]);
}
