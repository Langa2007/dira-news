import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createRegion, listRegions } from '../controllers/regionController.js';

const router = express.Router();

router.get('/', asyncHandler(listRegions));
router.post('/', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createRegion));

export default router;

