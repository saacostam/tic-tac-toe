import { Flex, Text } from "@mantine/core";
import { TodoList } from "@/features/todo/ui";

export default function HomeScreen() {
	return (
		<Flex direction="column" gap="md">
			<Text size="xl" fw="bold" display="block">
				📌 Todo List
			</Text>
			<TodoList />
		</Flex>
	);
}
