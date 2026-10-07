import { Router } from 'express';
import { getAnalyticsOverviewController } from '../controllers/analytics.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware, requireAdmin);
router.get('/overview', getAnalyticsOverviewController);

export default router;