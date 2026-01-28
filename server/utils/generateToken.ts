import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const generateToken = (res: any, userId: string) => {
  const token = jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;