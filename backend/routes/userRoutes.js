import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createUserEvent, getPreferences, updatePreferences } from '../controllers/userController.js';

const router = express.Router();

router.get('/me/preferences', requireAuth, asyncHandler(getPreferences));
router.put('/me/preferences', requireAuth, asyncHandler(updatePreferences));
router.post('/me/events', requireAuth, asyncHandler(createUserEvent));

export default router;
