import {
	AppShell,
	Burger,
	Button,
	Container,
	Flex,
	Group,
	UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type PropsWithChildren, useCallback } from "react";
import { ThemeToggle } from "@/features/theme/ui";
import { useAdapters } from "@/shared/adapters/core/app";
import { RouteName } from "@/shared/adapters/navigation/domain";
import { Link } from "@/shared/adapters/navigation/ui";
import { Logo } from "@/shared/components";

export function AppLayout({ children }: PropsWithChildren) {
	const { sessionAdapter, navigationAdapter } = useAdapters();

	const [opened, { toggle }] = useDisclosure();

	const onClickRename = useCallback(
		() => sessionAdapter.removeToken(),
		[sessionAdapter.removeToken],
	);

	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					<Group justify="space-between" style={{ flex: 1 }}>
						<UnstyledButton
							component={Link}
							to={navigationAdapter.generateRoute({
								name: RouteName.HOME,
							})}
						>
							<Logo />
						</UnstyledButton>
						<Flex gap="lg">
							<Button onClick={onClickRename}>Rename</Button>
							<ThemeToggle />
						</Flex>
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Main>
				<Container mx="auto">{children}</Container>
			</AppShell.Main>
		</AppShell>
	);
}
