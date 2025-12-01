import compression from 'compression';
import { Request, Response } from 'express';

export const shouldCompress = (req: Request, res: Response): boolean => {
    if (req.headers['x-no-compression']) {
        return false;
    }

    if (process.env.NODE_ENV !== 'production') {
        return false;
    }

    return true;
};

export const compressionOptions = {
    level: 6,
    threshold: 1024,
    filter: shouldCompress,
    brotli: {
        params: {
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: 4
        }
    }
};

export const compressionMiddleware = compression(compressionOptions);