import { authMiddleware } from "@/middleware/auth";
import { apiKeyMiddleware } from "@/middleware/apiKey";
import { Response, Request, NextFunction, Router } from "express";
import ProjectsController from "../controllers/projects.controller";

const projects: Router = Router();
const projectsController = new ProjectsController();

projects.route("/list").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => projectsController.getAllProjects(req, res, next))
projects.route("/getById").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => projectsController.getProjectById(req, res, next))
projects.route("/create").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => projectsController.createProject(req, res, next))
projects.route("/update").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => projectsController.updateProject(req, res, next))
projects.route("/delete").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => projectsController.deleteProject(req, res, next))

export default projects;