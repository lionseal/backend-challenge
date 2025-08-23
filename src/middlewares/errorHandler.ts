import { NextFunction, Request, Response } from 'express';
import { handleError } from '../controllers/responseHandler';

function toHttpError(error: Error): { statusCode: number; message: string } {
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (error instanceof NotFoundError) {
        statusCode = 404;
        message = error.message;
    } else if (error instanceof BadRequestError) {
        statusCode = 400;
        message = error.message;
    } else if (error instanceof InternalServerError) {
        statusCode = 500;
        message = error.message;
    }
    return { statusCode, message };
}

export class NotFoundError extends Error {
    constructor(entity: string) {
        super(`${entity} not found`);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message || 'Bad Request');
        this.name = 'BadRequestError';
    }
}

export class InternalServerError extends Error {
    constructor(message: string) {
        super(message || 'Internal Server Error');
        this.name = 'InternalServerError';
    }
}

export function expressErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(error);
    }
    const { statusCode, message } = toHttpError(error);
    handleError(req, res, statusCode, message);
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
