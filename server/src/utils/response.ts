// server/src/utils/response.ts

import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  message?: string;
  errors?:  { field: string; message: string }[];
}

export const sendSuccess = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ success: true, data } satisfies ApiResponse<T>);
};

export const sendError = (
  res:     Response,
  message: string,
  status = 400,
  errors?: { field: string; message: string }[],
): void => {
  const body: ApiResponse = { success: false, message };
  if (errors?.length) body.errors = errors;
  res.status(status).json(body);
};