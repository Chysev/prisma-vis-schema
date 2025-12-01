import { authMiddleware } from "@/middleware/auth";
import { apiKeyMiddleware } from "@/middleware/apiKey";
import AuthController from "../controllers/auth.controller";
import { Response, Request, NextFunction, Router } from "express";

const auth: Router = Router();
const authController = new AuthController();

auth.route("/login").post(apiKeyMiddleware, (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next))
auth.route("/register").post(apiKeyMiddleware, (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next))
auth.route("/session").post(apiKeyMiddleware, authMiddleware, (req: Request, res: Response, next: NextFunction) => authController.sessionToken(req, res, next))

export default auth;