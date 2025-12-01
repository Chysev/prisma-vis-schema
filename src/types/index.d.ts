import { Request } from 'express';

export type Auth = {
    id: string;
    [key: string]: any;
}


export type CsrfMiddlewareOptions = {
    headerName?: string;
    ignoreExpiration?: boolean;
    protectedMethods?: string[];
    getUserId?: (req: Request) => string;
}

export type UserAgentInfo = {
    browser: {
        name: string | undefined;
        version: string | undefined;
        major: string | undefined;
    };
    engine: {
        name: string | undefined;
        version: string | undefined;
    };
    os: {
        name: string | undefined;
        version: string | undefined;
    };
    device: {
        vendor: string | undefined;
        model: string | undefined;
        type: string | undefined;
    };
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
    isBot: boolean;
    raw: string;
}

export type UserAgentOptions = {
    blockOldBrowsers?: boolean;
    minBrowserVersions?: {
        [key: string]: string;
    };
}

declare global {
    namespace Express {
        interface Request {
            user: Auth;
            userAgent?: UserAgentInfo;
        }
    }
}

export { }