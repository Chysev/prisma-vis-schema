import Cookies from "js-cookie";

export const useToken = () => {
    if (typeof window !== 'undefined') {
        const token = Cookies.get(`${import.meta.env.VITE_TOKEN_NAME}`);
        if (token) return token;
    }

    return null;
};