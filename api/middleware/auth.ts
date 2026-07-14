import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        401,
        ErrorCodes.UNAUTHORIZED,
        'Missing or invalid authorization header'
      );
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid or expired token');
    }

    req.userId = user.id;
    req.user = user;

    logger.debug('User authenticated', { userId: user.id });
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }

    logger.error('Auth middleware error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Authentication failed',
    });
  }
}

export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    supabase.auth.getUser(token).then(({ data: { user } }) => {
      if (user) {
        req.userId = user.id;
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}
