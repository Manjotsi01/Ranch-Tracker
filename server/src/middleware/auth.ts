import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

interface JwtPayload {
  id:   string;
  role: string;
  iat:  number;
  exp:  number;
}

export const protect = (
  req:  AuthRequest,
  res:  Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    sendError(res, 'Not authorized — no token provided', 401);
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded   = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId      = decoded.id;
    req.userRole    = decoded.role;
    next();
  } catch (err: unknown) {
    const msg = err instanceof jwt.TokenExpiredError
      ? 'Token expired — please log in again'
      : 'Token invalid';
    sendError(res, msg, 401);
  }
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      sendError(res, 'Forbidden — insufficient permissions', 403);
      return;
    }
    next();
  };