import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createStoryCluster, listStoryClusters } from '../controllers/storyClusterController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(listStoryClusters));
router.post('/', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createStoryCluster));

export default router;

