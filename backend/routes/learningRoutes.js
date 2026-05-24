import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  enrollCourse,
  getCourseById,
  getCourses,
  getRecommendations,
  getStudyTasks,
  updateLessonProgress,
  updateStudyTask
} from '../controllers/learningController.js';

const router = Router();

router.use(requireAuth);

router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.post('/courses/:id/enroll', enrollCourse);
router.patch('/lessons/:lessonId/progress', updateLessonProgress);
router.get('/tasks', getStudyTasks);
router.patch('/tasks/:taskId', updateStudyTask);
router.get('/recommendations', getRecommendations);

export default router;
