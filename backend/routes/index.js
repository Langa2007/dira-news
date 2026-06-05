import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import sourceRoutes from './sourceRoutes.js';
import articleRoutes from './articleRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sources', sourceRoutes);
router.use('/articles', articleRoutes);

export default router;
