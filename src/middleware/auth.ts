import { Auth } from "@/types";
import appConfig from "@/config";
import { HttpError } from "@/lib/error";
import { CipherToken } from "@/lib/token";
import { Request, Response, NextFunction } from 'express';


const httpError = new HttpError()
const cipherToken = new CipherToken(appConfig.ENC_KEY_SECRET, appConfig.CIPHER_KEY_SECRET);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authToken = req.headers?.authorization;

    if (!authToken?.startsWith("Bearer ")) {
        next(httpError.unauthorized('Unauthorized - Missing Token'));
        return;
    }

    const token = authToken.slice(7);

    try {
        const decryptedToken = await cipherToken.decrypt(token);

        if (!decryptedToken) {
            next(httpError.unauthorized('Unauthorized - Invalid Token'));
            return;
        }

        req.user = decryptedToken as Auth;
        next();
    } catch (error) {
        next(httpError.unauthorized('Unauthorized - Authentication Failed'));
    }
};

