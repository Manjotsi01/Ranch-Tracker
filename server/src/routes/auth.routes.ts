import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { sendSuccess, sendError } from '../utils/response';
import { env } from '../config/env';
import User from '../models/user';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email:    z.string().email(),
    password: z.string().min(6),
  }),
});

const registerSchema = z.object({
  body: z.object({
    name:     z.string().min(2).max(60),
    email:    z.string().email(),
    password: z.string().min(8).max(72),
    role:     z.enum(['OWNER', 'WORKER', 'VIEWER']).optional().default('VIEWER'),
  }),
});

const signToken = (id: string, role: string) =>
  jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    sendError(res, 'Email already registered', 409);
    return;
  }
  const hashed = await bcrypt.hash(password, 12);
  const user   = await User.create({ name, email, password: hashed, role });
  const token  = signToken(String(user._id), user.role);
  sendSuccess(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 201);
});

router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }
  const token = signToken(String(user._id), user.role);
  sendSuccess(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', async (req: Request, res: Response) => {
  sendSuccess(res, { message: 'Auth check OK' });
});

export default router;