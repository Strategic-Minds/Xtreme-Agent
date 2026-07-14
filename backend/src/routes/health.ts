import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();
const startTime = Date.now();

// GET /api/health
router.get('/', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  logger.debug('Health check');

  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime,
    timestamp: new Date().toISOString(),
  });
});

export default router;
