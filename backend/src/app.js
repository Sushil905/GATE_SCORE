import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin, requireAuth } from './auth.js';
import { upload } from './config/upload.js';
import { addResource } from './controllers/resourceController.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'GATE_SCORE API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api', dashboardRoutes);

app.post('/api/admin/resources', requireAuth, requireAdmin, upload.single('file'), addResource);

app.use(errorHandler);

export default app;
