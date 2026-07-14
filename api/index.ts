import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import builderRoutes from './routes/builder.js';
import healthRoutes from './routes/health.js';
import { logger } from './utils/logger.js';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', builderRoutes);
app.use('/api/health', healthRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Xtreme Agent API is running' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel serverless
export default app;
