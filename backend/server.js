import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin, requireAuth } from './middleware/authMiddleware.js';
import { upload } from './config/upload.js';
import { addResource } from './controllers/resourceController.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import testRoutes from './routes/testRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = new Set([
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://192.168.13.157:5174'
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    if (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5174$/.test(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'GATE_SCORE API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api', dashboardRoutes);

app.post('/api/admin/resources', requireAuth, requireAdmin, upload.single('file'), addResource);

app.use((error, req, res, next) => {
  console.error(error);
  return res.status(error.status || 500).json({
    message: error.message || 'Server error'
  });
});

const port = Number(process.env.PORT || 5001);
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  console.log(`GATE_SCORE API running on http://${host}:${port}`);
});
