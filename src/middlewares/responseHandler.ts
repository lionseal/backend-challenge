import { Request, Response } from 'express';

export function handleResponse(req: Request, res: Response, result: any, entityName: string) {
    if (!result) {
        res.status(404).json({ message: `${entityName} not found` });
        return;
    }
    res.status(200).json(result);
}
