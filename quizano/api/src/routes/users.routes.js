import express from 'express';
import { readDb, writeDb } from '../lib/db.js';
import { makeId, sanitizeUser } from '../lib/core.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createError } from '../middleware/error.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { role, search = '' } = req.query;
    const db = await readDb();

    const users = db.users.filter((u) => {
      const rolePass = role ? u.role === role : true;
      const keyword = String(search).trim().toLowerCase();
      const searchPass = !keyword
        ? true
        : [u.username, u.fullName, u.email].join(' ').toLowerCase().includes(keyword);
      return rolePass && searchPass;
    }).map(sanitizeUser);

    res.status(200).json({
      ok: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

router.post('/students', async (req, res, next) => {
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

    const newStudent = {
      id: makeId('sv'),
      fullName: String(fullName).trim(),
      username: String(username).trim(),
      email: String(email).trim(),
      password: String(password),
      role: 'student'
    };

    db.users.push(newStudent);
    await writeDb(db);

    res.status(201).json({
      ok: true,
      data: sanitizeUser(newStudent)
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, email, password } = req.body || {};

    const db = await readDb();
    const index = db.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw createError(404, 'User not found');
    }

    const user = db.users[index];

    if (email && email !== user.email) {
      const duplicated = db.users.some((u) => u.id !== userId && u.email.toLowerCase() === String(email).toLowerCase());
      if (duplicated) {
        throw createError(409, 'Email already exists');
      }
      user.email = String(email).trim();
    }

    if (fullName) {
      user.fullName = String(fullName).trim();
    }

    if (password) {
      user.password = String(password);
    }

    db.users[index] = user;
    await writeDb(db);

    res.status(200).json({
      ok: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = await readDb();

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw createError(404, 'User not found');
    }

    if (user.role === 'admin') {
      throw createError(400, 'Cannot delete admin user');
    }

    db.users = db.users.filter((u) => u.id !== userId);
    await writeDb(db);

    res.status(200).json({
      ok: true,
      data: {
        deleted: true,
        userId
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
