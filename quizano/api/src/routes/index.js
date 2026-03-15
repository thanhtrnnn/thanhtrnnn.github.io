import express from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import examsRoutes from './exams.routes.js';
import resultsRoutes from './results.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/exams', examsRoutes);
router.use('/results', resultsRoutes);
router.use('/admin', adminRoutes);

export default router;
