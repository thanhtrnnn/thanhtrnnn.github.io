import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';
import { readDb } from '../lib/db';
import { sanitizeUser } from '../lib/core';
import { createError } from './error';

export interface AuthRequest extends Request {
  user?: any;
  userRaw?: any;
}

export function signToken(user: any) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '12h' }
  );
}

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw createError(401, 'Missing or invalid Authorization header');
    }

    const payload = jwt.verify(token, jwtSecret) as any;
    const db = await readDb();
    const user = db.users.find((item) => item.id === payload.sub);

    if (!user) {
      throw createError(401, 'User does not exist');
    }

    req.user = sanitizeUser(user);
    req.userRaw = user;
    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
      return;
    }
    next(createError(401, 'Invalid or expired access token'));
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(createError(401, 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(createError(403, 'Forbidden'));
      return;
    }
    next();
  };
}
