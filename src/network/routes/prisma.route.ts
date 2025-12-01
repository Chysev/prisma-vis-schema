import { authMiddleware } from "@/middleware/auth";
import { apiKeyMiddleware } from "@/middleware/apiKey";
import PrismaController from "../controllers/prisma.controller";
import { Response, Request, NextFunction, Router } from "express";

const prisma: Router = Router();
const prismaController = new PrismaController();

prisma.route("/prisma_cli").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => prismaController.prisma_cli(req, res, next))
prisma.route("/prisma_push").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => prismaController.prisma_push(req, res, next))
prisma.route("/prisma_migrate").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => prismaController.prisma_migrate(req, res, next))

export default prisma;