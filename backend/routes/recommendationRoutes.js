import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getMyFeed } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/me/feed', requireAuth, asyncHandler(getMyFeed));

export default router;

