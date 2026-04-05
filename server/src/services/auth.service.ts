import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/user';
import { createError } from '../middleware/errorHandler';

export const registerUser = async (data: {
  name: string; email: string; password: string; role?: string;
}) => {
  if (await User.exists({ email: data.email })) {
    throw createError('Email already in use', 409, 'EMAIL_TAKEN');
  }
  const hashed = await bcrypt.hash(data.password, 12);
  const user   = await User.create({ ...data, password: hashed });
  return buildResponse(user);
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  return buildResponse(user);
};

const buildResponse = (user: InstanceType<typeof User> & { password?: string }) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};