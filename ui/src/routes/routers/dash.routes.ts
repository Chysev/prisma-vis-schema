import { DashboardLayout } from "../_root"
import Dashboard from "@/app/(dashboard)/Dashboard"
import { createRoute } from "@tanstack/react-router"

export const DashboardRoute = createRoute({
    getParentRoute: () => DashboardLayout,
    path: "/",
    component: Dashboard
})