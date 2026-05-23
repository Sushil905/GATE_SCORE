import { Router } from 'express';
import { upload } from '../config/upload.js';
import { requireAdmin, requireAuth } from '../auth.js';
import { addResource, getResources } from '../controllers/resourceController.js';

const router = Router();

router.get('/', getResources);
router.post('/add', requireAuth, requireAdmin, upload.single('file'), addResource);

export default router;
