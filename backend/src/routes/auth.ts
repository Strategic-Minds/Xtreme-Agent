import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Email and password required');
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUpWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, authError.message);
    }

    // Create user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email,
        full_name: full_name || '',
      })
      .select()
      .single();

    if (userError) {
      logger.error('Failed to create user profile', userError);
      throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to create user profile');
    }

    logger.info('User signed up', { userId: authData.user?.id, email });

    res.status(201).json({
      user,
      session: authData.session,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Signup error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Signup failed',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Email and password required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, error.message);
    }

    logger.info('User logged in', { userId: data.user?.id, email });

    res.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Login error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Login failed',
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AppError(500, ErrorCodes.INTERNAL_ERROR, error.message);
    }

    logger.info('User logged out', { userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Logout error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Logout failed',
    });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'User not found');
    }

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Get user error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to get user',
    });
  }
});

export default router;
