// server/src/utils/response.ts
import { Response } from 'express';

export const sendSuccess = (res: Response, data: unknown, status: number = 200) => {
  res.status(status).json({ success: true, data });
};

export const sendError = (res: Response, message: string, status: number = 400) => {
  res.status(status).json({ success: false, error: message });
};