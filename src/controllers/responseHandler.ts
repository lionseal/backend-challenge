import { Request, Response } from 'express';

function sendJsonResponse(res: Response, statusCode: number, data: any) {
    res.status(statusCode).json(data);
}

export function handleOk(req: Request, res: Response, result: any) {
    sendJsonResponse(res, 200, result);
}

export function handleError(req: Request, res: Response, statusCode: number, errorMessage: string) {
    sendJsonResponse(res, statusCode, { message: errorMessage });
}
