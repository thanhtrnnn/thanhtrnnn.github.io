import express from 'express';
import { readDb, writeDb } from '../lib/db.js';
import { makeId, sanitizeUser } from '../lib/core.js';
import { createError } from '../middleware/error.js';
import { authenticate, signToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body || {};

    if (!fullName || !username || !email || !password) {
      throw createError(400, 'fullName, username, email and password are required');
    }

    const db = await readDb();
    const usernameExists = db.users.some((u) => u.username.toLowerCase() === String(username).toLowerCase());
    if (usernameExists) {
      throw createError(409, 'Username already exists');
    }

    const emailExists = db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (emailExists) {
      throw createError(409, 'Email already exists');
    }

    const newUser = {
      id: makeId('sv'),
      username: String(username).trim(),
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      password: String(password),
      role: 'student'
    };

    db.users.push(newUser);
    await writeDb(db);

    const token = signToken(newUser);
    res.status(201).json({
      ok: true,
      data: {
        token,
        user: sanitizeUser(newUser)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password, role } = req.body || {};

    if (!username || !password) {
      throw createError(400, 'username and password are required');
    }

    const db = await readDb();
    const found = db.users.find((u) => {
      const roleMatch = role ? u.role === role : true;
      return u.username === username && u.password === password && roleMatch;
    });

    if (!found) {
      throw createError(401, 'Invalid credentials');
    }

    const token = signToken(found);
    res.status(200).json({
      ok: true,
      data: {
        token,
        user: sanitizeUser(found)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const db = await readDb();
    const user = db.users.find((item) => item.id === req.user.id);
    if (!user) {
      throw createError(404, 'User not found');
    }

    res.status(200).json({
      ok: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
