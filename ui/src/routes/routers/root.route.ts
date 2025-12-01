import { rootRoute } from "../_root"
import Home from "@/app/(root)/Home"
import { createRoute } from "@tanstack/react-router"

export const RootRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home
})