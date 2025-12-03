import { authApi } from "@/db/api/auth.api";
import { redirect } from "@tanstack/react-router";

interface AuthSuccessResponse {
    [key: string]: any;
}

export const authMiddleware = async (pathname: string, searchParams?: Record<string, any>): Promise<AuthSuccessResponse | null> => {
    const auth_route = pathname === "/auth/register" || pathname === "/auth/login";

    try {
        const response = await authApi.session();

        if (auth_route) {
            const redirectTo = searchParams?.redirect || "/dashboard";
            throw redirect({
                to: redirectTo,
            });
        }

        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            if (auth_route) {
                return null;
            }

            throw redirect({
                to: "/auth/login",
                search: { redirect: pathname },
            });
        }
        throw error;
    }
}