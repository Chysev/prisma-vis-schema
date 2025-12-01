import api from "@/http/xior";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/app/auth.type";

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post("/auth/login", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post("/auth/register", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    session: async (): Promise<AuthResponse> => {
        try {
            const response: any = await api.post("/auth/session");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};