import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createTopic, listTopics } from '../controllers/topicController.js';

const router = express.Router();

router.get('/', asyncHandler(listTopics));
router.post('/', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createTopic));

export default router;

