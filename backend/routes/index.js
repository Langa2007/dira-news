import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import sourceRoutes from './sourceRoutes.js';
import articleRoutes from './articleRoutes.js';
import healthRoutes from './healthRoutes.js';
import topicRoutes from './topicRoutes.js';
import regionRoutes from './regionRoutes.js';
import storyClusterRoutes from './storyClusterRoutes.js';
import aiOutputRoutes from './aiOutputRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import socialDraftRoutes from './socialDraftRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import editorialRoutes from './editorialRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sources', sourceRoutes);
router.use('/articles', articleRoutes);
router.use('/topics', topicRoutes);
router.use('/regions', regionRoutes);
router.use('/story-clusters', storyClusterRoutes);
router.use('/ai-outputs', aiOutputRoutes);
router.use('/media', mediaRoutes);
router.use('/social-drafts', socialDraftRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/editorial', editorialRoutes);

export default router;
