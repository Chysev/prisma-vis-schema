import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import nocache from "nocache";
import express from "express";
import appConfig from "./config";
import AppRouter from "./network";
import cookieParser from "cookie-parser";
import { corsOptions } from "./middleware/cors";
import { Request, Response, NextFunction } from "express";

class index {
    public app: express.Application;
    private appRouter = new AppRouter().router;

    constructor() {
        this.app = express();
        this.Middleware();
        this.Routes();
        this.ErrorHandler();
    }

    private Middleware(): void {
        this.app.use(helmet());
        this.app.use(nocache());
        this.app.use(express.json());
        this.app.use(morgan("dev"));
        this.app.disable("x-powered-by");
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.set("trust proxy", 1);
        this.app.use(cors(corsOptions));
    }

    private Routes(): void {
        this.app.use(`/${appConfig.BASEROUTE}/${appConfig.VERSION}`, this.appRouter)
    }

    private ErrorHandler(): void {
        this.app.use(
            (error: any, req: Request, res: Response, next: NextFunction): void => {
                const statusCode = error.statusCode || 500;
                const message = error.message || "Internal Server Error";
                const rawErrors = error.rawErrors || [];

                res.status(statusCode).json({
                    message,
                    error: {
                        statusCode,
                        rawErrors,
                    },
                });
            }
        );
    }
}

export default index