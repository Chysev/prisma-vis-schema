import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import nocache from 'nocache';

export const securityHeaders = () => {
  const middlewares = [
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      xFrameOptions: { action: "deny" },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),

    nocache(),

    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=(), magnetometer=(), gyroscope=(), payment=()"
      );
      next();
    },

    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
      next();
    },
  ];

  return (req: Request, res: Response, next: NextFunction) => {
    let currentMiddlewareIndex = 0;

    const executeNextMiddleware = () => {
      if (currentMiddlewareIndex < middlewares.length) {
        const currentMiddleware = middlewares[currentMiddlewareIndex];
        currentMiddlewareIndex++;
        currentMiddleware(req, res, executeNextMiddleware);
      } else {
        next();
      }
    };

    executeNextMiddleware();
  };
};

export default securityHeaders;