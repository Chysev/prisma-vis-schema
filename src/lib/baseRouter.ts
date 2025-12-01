import { Router } from "express";

/**
 * Abstract base class for Express routers.
 * Extend this class and register routes inside `initRoutes()`.
 */
export abstract class baseRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    /**
     * Each subclass must implement this to register routes.
     */
    protected abstract initRoutes(): void;
}
