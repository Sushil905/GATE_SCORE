import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { chatWithAi, explainAnswer, generateQuestions, generateStudyPlan, recommendResources } from '../controllers/aiController.js';

const router = Router();

router.post('/chat', requireAuth, chatWithAi);
router.post('/study-plan', requireAuth, generateStudyPlan);
router.post('/generate-questions', requireAuth, generateQuestions);
router.post('/explain-answer', requireAuth, explainAnswer);

router.post('/doubt', requireAuth, chatWithAi);
router.post('/questions', requireAuth, generateQuestions);
router.post('/explain', requireAuth, explainAnswer);
router.post('/recommend', requireAuth, recommendResources);

export default router;
