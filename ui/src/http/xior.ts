import xior from "xior";
import { useToken } from "@/hooks/useToken";

const api = xior.create({
    baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

api.interceptors.request.use(
    (config) => {
        const token = useToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers['api-key'] = import.meta.env.VITE_API_KEY;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;