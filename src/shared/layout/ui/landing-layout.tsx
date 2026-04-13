import {
	AppShell,
	Container,
	Flex,
	Group,
	UnstyledButton,
} from "@mantine/core";
import type { PropsWithChildren } from "react";
import { ThemeToggle } from "@/features/theme/ui";
import { useAdapters } from "@/shared/adapters/core/app";
import { RouteName } from "@/shared/adapters/navigation/domain";
import { Link } from "@/shared/adapters/navigation/ui";
import { Logo } from "@/shared/components";

export function LandingLayout({ children }: PropsWithChildren) {
	const { navigationAdapter } = useAdapters();

	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header px="md">
				<Group h="100%" justify="space-between" style={{ flex: 1 }}>
					<UnstyledButton
						component={Link}
						to={navigationAdapter.generateRoute({
							name: RouteName.LANDING,
						})}
					>
						<Logo />
					</UnstyledButton>
					<Flex gap="lg">
						<ThemeToggle />
					</Flex>
				</Group>
			</AppShell.Header>

			<AppShell.Main>
				<Container mx="auto">{children}</Container>
			</AppShell.Main>
		</AppShell>
	);
}
