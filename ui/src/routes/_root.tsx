import { RootRoute } from "./routers/root.route";
import { DashboardRoute } from "./routers/dash.routes";
import { authMiddleware } from "@/middleware/authMiddleware";
import { LoginRoute, RegisterRoute } from "./routers/auth.routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import Editor from "@/app/(dashboard)/Editor";

const queryClient = new QueryClient();

export const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

export const DashboardLayout = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    beforeLoad: async ({ location }) => {
        await authMiddleware(location.pathname);
    },
    component: () => (
        <QueryClientProvider client={queryClient}>
            <Outlet />
        </QueryClientProvider>
    )
})

export const AuthLayout = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth",
    beforeLoad: async ({ location }) => {
        await authMiddleware(location.pathname);
    },
    component: () => (
        <QueryClientProvider client={queryClient}>
            <Outlet />
        </QueryClientProvider>
    )
})

export const EditorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/editor/$id",
    // beforeLoad: async ({ location }) => {
    //     await authMiddleware(location.pathname);
    // },
    component: () => (
        <QueryClientProvider client={queryClient}>
            <Editor />
        </QueryClientProvider>
    )
})

export const routerTree = rootRoute.addChildren([
    DashboardLayout.addChildren([
        DashboardRoute
    ]),
    AuthLayout.addChildren([
        LoginRoute,
        RegisterRoute
    ]),
    RootRoute,
    EditorRoute
]);