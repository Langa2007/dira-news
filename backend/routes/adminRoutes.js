import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import pipelineController from '../controllers/pipelineController.js';

const router = express.Router();

// POST /admin/pipeline/refresh
router.post('/pipeline/refresh', requireAuth, requireRole('ADMIN'), pipelineController.refresh);

export default router;
