import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { streamChatCompletion } from '../services/ai.js';
import { logger } from '../utils/logger.js';

const router = Router();

interface BuilderRequest extends Request {
  user?: { id: string; email: string };
  body: {
    prompt: string;
    currentState?: {
      html: string;
      css: string;
      javascript: string;
      title: string;
    };
  };
}

router.post('/builder', authenticateToken, async (req: BuilderRequest, res: Response) => {
  try {
    const { prompt, currentState } = req.body;
    const userId = req.user?.id;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    logger.info(`Builder request from user ${userId}: ${prompt}`);

    // Check for cloning/scraping requests
    const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
    let scrapedData = null;
    if (urlMatch && (prompt.toLowerCase().includes('clone') || prompt.toLowerCase().includes('scrape'))) {
      try {
        const { scrapeWebsite } = await import('../services/scraper.js');
        scrapedData = await scrapeWebsite(urlMatch[0]);
      } catch (error) {
        logger.error('Scraping failed during builder request', error);
      }
    }

    const systemPrompt = `You are an expert web developer and UI/UX designer. Your task is to generate HTML, CSS, and JavaScript code based on user requests.

${scrapedData ? `The user wants to clone/scrape this website:
Title: ${scrapedData.title}
HTML Structure: ${scrapedData.html}
CSS Styles: ${scrapedData.css}

Use this data to recreate the website as closely as possible, but optimize it for a clean, modern look.` : ''}

When the user asks you to build something, respond with a JSON object containing:
{
  "html": "<div>...</div>",
  "css": "body { ... }",
  "javascript": "console.log('...');",
  "title": "Page Title",
  "message": "A brief description of what was built"
}

Guidelines:
- Generate complete, production-ready code
- Use modern CSS with Tailwind-like utilities
- Make the design responsive and beautiful
- Include proper semantic HTML
- Optimize for performance
- If cloning a website, recreate its structure and styling as closely as possible
- For funnels, create multi-step forms with proper UX
- Always include proper error handling in JavaScript

Current state:
HTML: ${currentState?.html || 'empty'}
CSS: ${currentState?.css || 'empty'}
JavaScript: ${currentState?.javascript || 'empty'}`;

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    let fullResponse = '';

    try {
      fullResponse = await streamChatCompletion(
        messages,
        (chunk) => {
          // In a real implementation, you might want to stream progress
          // For now, we'll just wait for the full response
        }
      );
    } catch (error) {
      logger.error('Stream error', error);
    }

    // Parse the response to extract JSON
    let parsedResponse = {
      html: currentState?.html || '<div></div>',
      css: currentState?.css || '',
      javascript: currentState?.javascript || '',
      title: currentState?.title || 'Built with Xtreme',
      message: 'Website updated',
    };

    try {
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      logger.warn('Failed to parse JSON response', parseError);
      parsedResponse.message = fullResponse.substring(0, 200);
    }

    res.json(parsedResponse);
  } catch (error) {
    logger.error('Builder error', error);
    res.status(500).json({ error: 'Failed to build website' });
  }
});

export default router;
