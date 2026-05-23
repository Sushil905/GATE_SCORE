import { Router } from 'express';
import { getPreviousYearQuestions } from '../controllers/testController.js';

const router = Router();

router.get('/', getPreviousYearQuestions);

export default router;
