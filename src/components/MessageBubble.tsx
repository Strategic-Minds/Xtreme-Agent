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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn mb-4`}>
      <div
        className={`max-w-2xl px-4 py-3 rounded-2xl backdrop-blur-md transition-all ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg shadow-blue-500/20'
            : isAssistant
            ? 'bg-slate-800/60 border border-slate-700/50 text-slate-100 rounded-bl-none hover:bg-slate-800/80'
            : 'bg-slate-700/60 text-slate-100 rounded-bl-none'
        }`}
      >
        {isAssistant ? (
          <MarkdownRenderer content={content} />
        ) : (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
          {new Date(created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
