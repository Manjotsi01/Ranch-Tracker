import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  errorCode?:  string;
  isOperational?: boolean;
}

export const createError = (
  message:   string,
  statusCode = 500,
  errorCode  = 'INTERNAL_ERROR',
): AppError => {
  const err: AppError = new Error(message);
  err.statusCode     = statusCode;
  err.errorCode      = errorCode;
  err.isOperational  = true;
  return err;
};

export const errorHandler = (
  err:  AppError,
  req:  Request,
  res:  Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500;
  const message    = err.isOperational
    ? err.message
    : 'An unexpected error occurred';

  logger.error(`${req.method} ${req.path} → ${statusCode}: ${err.message}`, err);

  res.status(statusCode).json({
    success:   false,
    message,
    errorCode: err.errorCode ?? 'SERVER_ERROR',
    ...(env.isProd() ? {} : { stack: err.stack }),
  });
};