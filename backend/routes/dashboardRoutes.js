import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getDashboard, predictScore } from '../controllers/dashboardController.js';

const router = Router();

router.get('/dashboard', requireAuth, getDashboard);
router.get('/predict-score', requireAuth, predictScore);

export default router;
