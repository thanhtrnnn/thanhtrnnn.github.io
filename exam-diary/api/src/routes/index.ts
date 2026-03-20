import express from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import examsRoutes from './exams.routes';
import resultsRoutes from './results.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/exams', examsRoutes);
router.use('/results', resultsRoutes);
router.use('/admin', adminRoutes);

export default router;
