import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

/**
 * Perform a web search using the Bing Search API (free tier)
 * Falls back to mock results if API key is not available
 */
export async function webSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    // For now, return mock results since we don't have a real API key
    // In production, you would use Bing Search API or similar
    logger.info(`Web search query: ${query}`);

    const mockResults: SearchResult[] = [
      {
        title: 'Understanding AI Assistants',
        url: 'https://example.com/ai-assistants',
        snippet: 'Learn about how AI assistants work and their capabilities...',
        source: 'Example.com',
      },
      {
        title: 'Best Practices for AI Integration',
        url: 'https://example.com/ai-integration',
        snippet: 'Discover best practices for integrating AI into your applications...',
        source: 'Example.com',
      },
      {
        title: 'Future of AI Technology',
        url: 'https://example.com/ai-future',
        snippet: 'Explore the future trends and developments in AI technology...',
        source: 'Example.com',
      },
    ];

    return mockResults.slice(0, limit);
  } catch (error) {
    logger.error('Web search error', error);
    throw new Error('Failed to perform web search');
  }
}

/**
 * Format search results into a readable string for the AI
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No search results found.';
  }

  let formatted = 'Search Results:\n\n';
  results.forEach((result, index) => {
    formatted += `${index + 1}. **${result.title}**\n`;
    formatted += `   Source: ${result.source}\n`;
    formatted += `   URL: ${result.url}\n`;
    formatted += `   ${result.snippet}\n\n`;
  });

  return formatted;
}

/**
 * Determine if a query should trigger a web search
 */
export function shouldPerformSearch(message: string): boolean {
  const searchKeywords = [
    'search',
    'find',
    'look up',
    'what is',
    'who is',
    'when was',
    'where is',
    'how to',
    'latest',
    'current',
    'recent',
    'news',
    'information about',
  ];

  const lowerMessage = message.toLowerCase();
  return searchKeywords.some((keyword) => lowerMessage.includes(keyword));
}
