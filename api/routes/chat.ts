import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { streamChatCompletion, countTokens } from '../services/ai.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/chat
router.post('/', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const { message, session_id, stream } = req.body;

    if (!message) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Message is required');
    }

    let sessionId = session_id;

    // Create new session if not provided
    if (!sessionId) {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          user_id: req.userId,
          title: message.substring(0, 50),
        })
        .select()
        .single();

      if (error) {
        throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to create session');
      }

      sessionId = session.id;
    }

    // Save user message
    const { data: userMsg, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        tokens: await countTokens(message),
      })
      .select()
      .single();

    if (userMsgError) {
      throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to save message');
    }

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    if (messagesError) {
      throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to fetch messages');
    }

    // Format messages for OpenAI
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    if (stream) {
      // Streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';

      await streamChatCompletion(
        formattedMessages,
        (chunk) => {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        },
        (error) => {
          logger.error('Streaming error', error);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        }
      );

      // Save assistant message
      await supabase.from('messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: fullResponse,
        tokens: await countTokens(fullResponse),
      });

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Non-streaming response
      const response = await streamChatCompletion(
        formattedMessages,
        () => {} // No-op for non-streaming
      );

      // Save assistant message
      const { data: assistantMsg, error: assistantMsgError } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: response,
          tokens: await countTokens(response),
        })
        .select()
        .single();

      if (assistantMsgError) {
        logger.error('Failed to save assistant message', assistantMsgError);
      }

      logger.info('Chat message processed', { sessionId, messageLength: response.length });

      res.json({
        reply: response,
        session_id: sessionId,
        message_id: assistantMsg?.id,
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Chat error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Chat failed',
    });
  }
});

// GET /api/sessions
router.get('/sessions', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to fetch sessions');
    }

    res.json({ sessions });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Get sessions error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to get sessions',
    });
  }
});

// GET /api/sessions/:id/messages
router.get('/sessions/:id/messages', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const sessionId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', req.userId)
      .single();

    if (sessionError || !session) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'Access denied');
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to fetch messages');
    }

    res.json({ messages });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Get messages error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to get messages',
    });
  }
});

// DELETE /api/sessions/:id
router.delete('/sessions/:id', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const sessionId = req.params.id;

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', req.userId)
      .single();

    if (sessionError || !session) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'Access denied');
    }

    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);

    if (error) {
      throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to delete session');
    }

    logger.info('Session deleted', { sessionId });
    res.json({ deleted: true });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.errorCode,
        message: error.message,
      });
    }
    logger.error('Delete session error', error);
    res.status(500).json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to delete session',
    });
  }
});

export default router;
