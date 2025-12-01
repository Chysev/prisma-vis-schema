import auth from "./routes/auth.route";
import prisma from "./routes/prisma.route";
import projects from "./routes/projects.route";
import { baseRouter } from "@/lib/baseRouter";

class AppRouter extends baseRouter {
    protected initRoutes(): void {
        this.router.use("/auth", auth);
        this.router.use("/prisma", prisma);
        this.router.use("/projects", projects);
    }
}

export default AppRouter