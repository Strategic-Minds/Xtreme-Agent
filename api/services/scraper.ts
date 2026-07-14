import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

export interface ScrapedWebsite {
  html: string;
  css: string;
  title: string;
  description: string;
}

/**
 * Scrape a website and extract its HTML structure
 */
export async function scrapeWebsite(url: string): Promise<ScrapedWebsite> {
  try {
    logger.info(`Scraping website: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'Cloned Website';

    // Extract meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    const description = descMatch ? descMatch[1] : '';

    // Extract CSS from style tags
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    let css = '';
    styleMatches.forEach((match) => {
      const content = match.replace(/<style[^>]*>/i, '').replace(/<\/style>/i, '');
      css += content + '\n';
    });

    // Extract body content (simplified)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;

    // Clean up the HTML
    const cleanedHtml = cleanHTML(bodyContent);

    return {
      html: cleanedHtml,
      css: css || getDefaultCSS(),
      title,
      description,
    };
  } catch (error) {
    logger.error('Scraping error', error);
    throw new Error('Failed to scrape website');
  }
}

/**
 * Clean and simplify HTML for better rendering
 */
function cleanHTML(html: string): string {
  // Remove script tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove style tags
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // Remove event handlers
  html = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Limit to first 10000 characters
  if (html.length > 10000) {
    html = html.substring(0, 10000) + '...';
  }

  return html.trim();
}

/**
 * Get default CSS for cloned websites
 */
function getDefaultCSS(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `;
}
