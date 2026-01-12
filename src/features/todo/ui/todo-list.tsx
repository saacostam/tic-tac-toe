import { QueryError, SuspenseLoader } from "@/shared/components";
import { useMetaQueryTodos } from "../app";
import { TodoListContent } from "./todo-list-content";

export function TodoList() {
	const todoQuery = useMetaQueryTodos();
	const todos = todoQuery.useQuery();

	if (todos.isError)
		return (
			<QueryError
				msg="Unable to load todos"
				retry={{ onClick: todos.refetch, isPending: todos.isLoading }}
			/>
		);
	if (todos.isSuccess)
		return (
			<TodoListContent
				todos={todos.data}
				optimSetTodos={todoQuery.setOptimisticData}
			/>
		);

	return <SuspenseLoader style={{ height: "8rem" }} />;
}
