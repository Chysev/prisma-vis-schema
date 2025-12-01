import { authApi } from "../api/auth.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: authApi.login,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    const sessionMutation = useMutation({
        mutationKey: ["auth", "session"],
        mutationFn: authApi.session,
    });

    const registerMutation = useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: authApi.register,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    return {
        loginMutation,
        sessionMutation,
        registerMutation,
    };
};