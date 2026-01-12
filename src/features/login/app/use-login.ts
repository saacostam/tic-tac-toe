import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAdapters } from "@/shared/adapters/core/app";
import { RouteName } from "@/shared/adapters/navigation/domain";
import { FormUtils } from "@/shared/utils/form";
import { useMutateLogin } from "./use-mutate-login";

const loginSchema = z.object({
	username: z.string().min(1, { message: "Username is required" }).max(48),
	password: z.string().min(1, { message: "Password is required" }).max(48),
});

export function useLogin() {
	const {
		analyticsAdapter,
		authAdapter,
		errorMonitoringAdapter,
		navigationAdapter,
		routerAdapter,
	} = useAdapters();

	const form = useForm({
		defaultValues: {
			username: "",
			password: "",
		},
		resolver: zodResolver(loginSchema),
	});

	const login = useMutateLogin();

	const onSubmit = useCallback(
		(data: ReturnType<typeof loginSchema.parse>) => {
			login.mutate(
				{
					...data,
				},
				{
					onSuccess: (data) => {
						authAdapter.setToken(data.token);
						routerAdapter.push(
							navigationAdapter.generateRoute({ name: RouteName.HOME }),
						);

						analyticsAdapter.trackEvent({
							name: "login",
							payload: {
								success: true,
							},
						});
					},
					onError: (error) => {
						FormUtils.handleApiErrors({
							error,
							setError: form.setError,
						});

						errorMonitoringAdapter.report(error, {
							where: "useLogin.onSubmit.login.mutate",
						});

						analyticsAdapter.trackEvent({
							name: "login",
							payload: {
								success: false,
							},
						});
					},
				},
			);
		},
		[
			analyticsAdapter.trackEvent,
			authAdapter.setToken,
			errorMonitoringAdapter.report,
			form.setError,
			login,
			navigationAdapter.generateRoute,
			routerAdapter.push,
		],
	);

	return useMemo(
		() => ({
			form,
			isLoading: login.isPending,
			onSubmit,
		}),
		[form, login.isPending, onSubmit],
	);
}
