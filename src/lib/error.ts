import { HttpStatusCode } from "axios";

/**
 * Unified HTTP Error utility class.
 * Can be used both statically (`HttpError.badRequest()`)
 * and via an instance (`new HttpError().badRequest()`).
 */
export class HttpError extends Error {
    public readonly statusCode: number;
    public readonly rawErrors: string[];

    constructor(statusCode?: number, message?: string, rawErrors?: string[]) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode ?? HttpStatusCode.InternalServerError;
        this.rawErrors = rawErrors ?? [];

        if (typeof (Error as any).captureStackTrace === "function") {
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Creates a new HttpError instance with a given status code.
     * Supports both static and instance usage.
     */
    of(statusCode: HttpStatusCode, message: string, rawErrors?: string[]): HttpError {
        return new HttpError(statusCode, message, rawErrors);
    }

    /** JSON representation */
    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errors: this.rawErrors.length ? this.rawErrors : undefined,
        };
    }

    /* ==== 4xx ==== */

    badRequest(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.BadRequest, message, errors);
    }

    unauthorized(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.Unauthorized, message, errors);
    }

    forbidden(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.Forbidden, message, errors);
    }

    notFound(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.NotFound, message, errors);
    }

    conflict(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.Conflict, message, errors);
    }

    unprocessableEntity(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.UnprocessableEntity, message, errors);
    }

    tooManyRequests(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.TooManyRequests, message, errors);
    }

    /* ==== 5xx ==== */

    internalServerError(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.InternalServerError, message, errors);
    }

    serviceUnavailable(message: string, errors?: string[]) {
        return this.of(HttpStatusCode.ServiceUnavailable, message, errors);
    }
}
