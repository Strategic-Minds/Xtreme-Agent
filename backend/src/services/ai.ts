import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onError?: (error: Error) => void
): Promise<string> {
  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10);

    logger.debug('Streaming chat completion', { model, messageCount: messages.length });

    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullResponse += text;
        onChunk(text);
      }
    }

    logger.info('Chat completion finished', { responseLength: fullResponse.length });
    return fullResponse;
  } catch (error) {
    logger.error('Chat completion error', error);
    if (onError) onError(error as Error);
    throw error;
  }
}

export async function getChatCompletion(
  messages: ChatMessage[]
): Promise<string> {
  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10);

    logger.debug('Getting chat completion', { model, messageCount: messages.length });

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    logger.info('Chat completion received', { responseLength: content.length });

    return content;
  } catch (error) {
    logger.error('Chat completion error', error);
    throw error;
  }
}

export async function countTokens(text: string): Promise<number> {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}
