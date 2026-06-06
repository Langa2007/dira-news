import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getLocalHotNews,
  getMyFeed,
  getWorldHotNews,
  queueMyRecommendationRefresh,
  refreshMyRecommendations
} from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/me/feed', requireAuth, asyncHandler(getMyFeed));
router.post('/me/refresh', requireAuth, asyncHandler(refreshMyRecommendations));
router.post('/me/refresh-job', requireAuth, asyncHandler(queueMyRecommendationRefresh));
router.get('/hot/local', requireAuth, asyncHandler(getLocalHotNews));
router.get('/hot/world', requireAuth, asyncHandler(getWorldHotNews));

export default router;
