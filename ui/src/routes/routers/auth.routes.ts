import { AuthLayout } from "../_root"
import Login from "@/app/(auth)/Login"
import Register from "@/app/(auth)/Register"
import { createRoute } from "@tanstack/react-router"

export const LoginRoute = createRoute({
    getParentRoute: () => AuthLayout,
    path: "/login",
    component: Login
})

export const RegisterRoute = createRoute({
    getParentRoute: () => AuthLayout,
    path: "/register",
    component: Register
})