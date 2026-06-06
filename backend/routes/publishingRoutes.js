import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  dispatchTarget,
  getAppFeedJson,
  getLogs,
  getRssXml,
  getSitemapXml,
  publishArticle,
  updateDraftStatus
} from '../controllers/publishingController.js';

const router = express.Router();
const editorialRoles = ['admin', 'editor', 'editor_in_chief'];
const publishingRoles = ['admin', 'editor_in_chief'];

router.get('/app-feed', asyncHandler(getAppFeedJson));
router.get('/rss.xml', asyncHandler(getRssXml));
router.get('/sitemap.xml', asyncHandler(getSitemapXml));

router.get('/logs', requireAuth, requireRole(...editorialRoles), asyncHandler(getLogs));
router.post('/articles/:id/publish', requireAuth, requireRole(...publishingRoles), asyncHandler(publishArticle));
router.post('/targets/:id/dispatch', requireAuth, requireRole(...publishingRoles), asyncHandler(dispatchTarget));
router.patch('/social-drafts/:id/status', requireAuth, requireRole(...editorialRoles), asyncHandler(updateDraftStatus));

export default router;
