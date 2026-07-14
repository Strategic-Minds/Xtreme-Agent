import React from 'react';
import { Message } from '../stores/chatStore';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps extends Message {}

export default function MessageBubble({
  role,
  content,
  created_at,
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : isAssistant
            ? 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
            : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}
      >
        {isAssistant ? (
          <MarkdownRenderer content={content} />
        ) : (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {new Date(created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
