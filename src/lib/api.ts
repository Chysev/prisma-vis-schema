import { HttpStatusCode } from "axios";
import { Response } from "express";

/**
 * Base API response interface
 */
interface ApiResponse<T = any> {
    message: string;
    data?: T;
    statusCode: number;
    timestamp: string;
}

/**
 * Abstract Api class that provides standardized methods for API responses
 *
 * This base class is designed to be extended by controller classes,
 * ensuring consistent response formats throughout the application.
 */
abstract class Api {
    /**
     * Sends a JSON response to the client with the given data.
     *
     * @protected
     * @template T - Type of the data being returned
     * @param {Response} res - Express response object
     * @param {T} data - Data to be included in the response
     * @param {HttpStatusCode} statusCode - HTTP status code
     * @param {string} message - Response message
     * @returns {Response} Express response object
     */
    protected send<T>(
        res: Response,
        data: T,
        statusCode: HttpStatusCode,
        message: string
    ): Response {
        const response: ApiResponse<T> = {
            message,
            statusCode,
            timestamp: new Date().toISOString(),
        };

        if (data !== undefined && data !== null) {
            response.data = data;
        }

        return res.status(statusCode).json(response);
    }

    /**
     * Sends a success response (HTTP 200 OK)
     *
     * @protected
     * @template T - Type of the data being returned
     * @param {Response} res - Express response object
     * @param {T} data - Data to be included in the response
     * @param {string} [message='Success'] - Response message
     * @returns {Response} Express response object
     */
    protected success<T>(
        res: Response,
        data: T,
        message: string = "Success"
    ): Response {
        return this.send(res, data, HttpStatusCode.Ok, message);
    }

    /**
     * Sends a created response (HTTP 201 Created)
     *
     * @protected
     * @template T - Type of the data being returned
     * @param {Response} res - Express response object
     * @param {T} data - Data to be included in the response
     * @param {string} [message='Resource created successfully'] - Response message
     * @returns {Response} Express response object
     */
    protected created<T>(
        res: Response,
        data: T,
        message: string = "Resource created successfully"
    ): Response {
        return this.send(res, data, HttpStatusCode.Created, message);
    }

    /**
     * Sends an error response with the specified status code
     *
     * @protected
     * @param {Response} res - Express response object
     * @param {HttpStatusCode} statusCode - HTTP status code
     * @param {string} message - Error message
     * @returns {Response} Express response object
     */
    protected error(
        res: Response,
        statusCode: HttpStatusCode = HttpStatusCode.InternalServerError,
        message: string = "An error occurred"
    ): Response {
        return this.send(res, null, statusCode, message);
    }

    /**
     * Sends a not found response (HTTP 404 Not Found)
     *
     * @protected
     * @param {Response} res - Express response object
     * @param {string} [message='Resource not found'] - Response message
     * @returns {Response} Express response object
     */
    protected notFound(
        res: Response,
        message: string = "Resource not found"
    ): Response {
        return this.send(res, null, HttpStatusCode.NotFound, message);
    }

    /**
     * Handles an internal server error and sends an appropriate response
     *
     * @protected
     * @param {Response} res - Express response object
     * @param {Error} error - The error that occurred
     * @param {string} [message='Internal server error'] - Response message
     * @returns {Response} Express response object
     */
    protected handleError(
        res: Response,
        error: Error,
        message: string = "Internal server error"
    ): Response {
        // Log the error (in a production environment, you would use a proper logger)
        console.error(`[ERROR] ${new Date().toISOString()}:`, error);

        // In development, include error details; in production, just send a generic message
        const errorResponse =
            process.env.NODE_ENV === "production"
                ? null
                : { name: error.name, message: error.message, stack: error.stack };

        return this.send(
            res,
            errorResponse,
            HttpStatusCode.InternalServerError,
            message
        );
    }
}

export default Api;
