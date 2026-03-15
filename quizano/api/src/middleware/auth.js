import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config.js';
import { readDb } from '../lib/db.js';
import { sanitizeUser } from '../lib/core.js';
import { createError } from './error.js';

function signToken(user) {
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

async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw createError(401, 'Missing or invalid Authorization header');
    }

    const payload = jwt.verify(token, jwtSecret);
    const db = await readDb();
    const user = db.users.find((item) => item.id === payload.sub);

    if (!user) {
      throw createError(401, 'User does not exist');
    }

    req.user = sanitizeUser(user);
    req.userRaw = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      next(error);
      return;
    }
    next(createError(401, 'Invalid or expired access token'));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
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

export { signToken, authenticate, authorize };
