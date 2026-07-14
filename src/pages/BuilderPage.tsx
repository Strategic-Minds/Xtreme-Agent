import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, Message } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../lib/api';

interface BuilderState {
  html: string;
  css: string;
  javascript: string;
  title: string;
}

export default function BuilderPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [builderState, setBuilderState] = useState<BuilderState>({
    html: '<div class="container"><h1>Welcome to Xtreme Builder</h1><p>Describe what you want to build...</p></div>',
    css: `body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; }
.container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; text-align: center; }
h1 { font-size: 2.5rem; margin-bottom: 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
p { font-size: 1.1rem; color: #cbd5e1; }`,
    javascript: '',
    title: 'Xtreme Builder',
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    updatePreview();
  }, [builderState]);

  const updatePreview = () => {
    if (iframeRef.current) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${builderState.title}</title>
          <style>
            ${builderState.css}
          </style>
        </head>
        <body>
          ${builderState.html}
          <script>
            ${builderState.javascript}
          </script>
        </body>
        </html>
      `;
      iframeRef.current.srcDoc = html;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/builder', {
        prompt: input,
        currentState: builderState,
      });

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: response.data.message || 'Website updated successfully',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update builder state with the generated code
      if (response.data.html || response.data.css || response.data.javascript) {
        setBuilderState((prev) => ({
          ...prev,
          html: response.data.html || prev.html,
          css: response.data.css || prev.css,
          javascript: response.data.javascript || prev.javascript,
          title: response.data.title || prev.title,
        }));
      }
    } catch (error) {
      console.error('Failed to build', error);
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while building. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar - Chat */}
      <div className="w-80 bg-slate-900/50 border-r border-slate-700/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md flex-shrink-0">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Xtreme Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">Autonomous Web Builder</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-8">
              <p className="text-sm">Describe what you want to build...</p>
              <p className="text-xs mt-2">Websites, funnels, clones, landing pages, and more!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600/80 text-white rounded-br-none'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/60 border border-slate-700/50 px-3 py-2 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Build a website..."
              disabled={loading}
              className="flex-1 px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              Build
            </button>
          </div>
        </form>
      </div>

      {/* Right Side - Editor & Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-md px-4 flex-shrink-0">
          <button className="px-4 py-3 text-sm font-medium text-blue-400 border-b-2 border-blue-500">
            Preview
          </button>
          <button className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent">
            HTML
          </button>
          <button className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent">
            CSS
          </button>
          <button className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent">
            JS
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden bg-slate-950">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
