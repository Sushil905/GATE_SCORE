import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { getTestById, getTests, submitTest } from '../controllers/testController.js';

const router = Router();

router.get('/', getTests);
router.post('/submit', requireAuth, submitTest);
router.get('/:id', getTestById);
router.post('/:id/submit', requireAuth, submitTest);

export default router;
