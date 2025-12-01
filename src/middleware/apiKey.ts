import appConfig from "@/config";
import { decryptKey } from "@/lib/apiKey";
import { HttpError } from "@/lib/error";
import { Request, Response, NextFunction } from "express";

const httpError = new HttpError()

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['api-key'];

    if (!key) {
        next(httpError.notFound("Missing Api Key"))
    }
    try {
        const decryptedKey = decryptKey(key as string);

        if (!decryptedKey) {
            next(httpError.unauthorized("You do not have access to this api"))
        }

        const decryptedApiKey = decryptKey(appConfig.API_KEY)

        if (decryptedKey === decryptedApiKey) {
            next()
        }
    } catch (error) {
        next(httpError.unauthorized("You do not have access to this api"))
    }
}