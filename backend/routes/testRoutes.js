import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getTestById, getTests, submitGeneratedTest, submitTest } from '../controllers/testController.js';

const router = Router();

router.get('/', getTests);
router.post('/submit', requireAuth, submitTest);
router.post('/generated/submit', requireAuth, submitGeneratedTest);
router.get('/:id', getTestById);
router.post('/:id/submit', requireAuth, submitTest);

export default router;
