import { Request, Response } from 'express';

export function handleOk(req: Request, res: Response, result: any) {
    res.status(200).json(result);
}
