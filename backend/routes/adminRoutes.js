import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import pipelineController from '../controllers/pipelineController.js';

const router = express.Router();

// POST /admin/pipeline/refresh
router.post('/pipeline/refresh', requireAuth, requireRole('ADMIN'), pipelineController.refresh);
router.get('/pipeline/status', requireAuth, requireRole('ADMIN'), pipelineController.status);
router.get('/pipeline/logs/:jobId', requireAuth, requireRole('ADMIN'), pipelineController.logs);

export default router;
