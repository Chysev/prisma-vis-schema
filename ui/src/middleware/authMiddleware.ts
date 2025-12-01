import { authApi } from "@/db/api/auth.api";
import { redirect } from "@tanstack/react-router";

interface AuthSuccessResponse {
    [key: string]: any;
}

export const authMiddleware = async (pathname: string): Promise<AuthSuccessResponse | null> => {
    const auth_route = pathname === "/auth/register" || pathname === "/auth/login";

    try {
        const response = await authApi.session();

        if (auth_route) {
            throw redirect({
                to: "/dashboard",
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