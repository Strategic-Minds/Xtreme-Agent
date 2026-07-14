import React, { useEffect, useRef, useState } from 'react';
import { useChatStore, Message } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';
import apiClient from '../lib/api';

interface ThinkingStep {
  id: string;
  type: 'planning' | 'searching' | 'executing' | 'reasoning';
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  details?: string;
  timestamp: number;
}

export default function ChatWindow() {
  const { activeSessionId, messages, setMessages, addMessage, loading, setLoading } =
    useChatStore();
  const { toggleSidebar } = useUIStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [showThinking, setShowThinking] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingSteps]);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const fetchMessages = async () => {
    if (!activeSessionId) return;
    try {
      const response = await apiClient.get(`/api/chat/sessions/${activeSessionId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const addThinkingStep = (step: Omit<ThinkingStep, 'id' | 'timestamp'>) => {
    const newStep: ThinkingStep = {
      ...step,
      id: Math.random().toString(),
      timestamp: Date.now(),
    };
    setThinkingSteps((prev) => [...prev, newStep]);
  };

  const updateThinkingStep = (id: string, updates: Partial<ThinkingStep>) => {
    setThinkingSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
  };

  const handleSendMessage = async (message: string) => {
    setLoading(true);
    setThinkingSteps([]);
    setShowThinking(true);

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };
    addMessage(userMessage);

    try {
      // Simulate thinking steps
      addThinkingStep({
        type: 'planning',
        title: 'Planning',
        status: 'in-progress',
        details: 'Analyzing your request...',
      });

      const planStepId = thinkingSteps[thinkingSteps.length - 1]?.id;

      // Simulate a small delay for planning
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (planStepId) {
        updateThinkingStep(planStepId, { status: 'completed' });
      }

      // Add searching step
      addThinkingStep({
        type: 'searching',
        title: 'Searching',
        status: 'in-progress',
        details: 'Gathering information...',
      });

      const response = await apiClient.post('/api/chat', {
        message,
        sessionId: activeSessionId,
      });

      // Update search step
      const searchStepId = thinkingSteps[thinkingSteps.length - 1]?.id;
      if (searchStepId) {
        updateThinkingStep(searchStepId, { status: 'completed' });
      }

      // Add executing step
      addThinkingStep({
        type: 'executing',
        title: 'Generating Response',
        status: 'in-progress',
        details: 'Composing answer...',
      });

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: response.data.message,
        created_at: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      // Complete executing step
      const execStepId = thinkingSteps[thinkingSteps.length - 1]?.id;
      if (execStepId) {
        updateThinkingStep(execStepId, { status: 'completed' });
      }

      // Auto-hide thinking after 2 seconds
      setTimeout(() => setShowThinking(false), 2000);
    } catch (error) {
      console.error('Failed to send message', error);
      const lastStep = thinkingSteps[thinkingSteps.length - 1];
      if (lastStep) {
        updateThinkingStep(lastStep.id, { status: 'error', details: 'An error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">Manus Assistant</h1>
              <p className="text-xs text-slate-400">Your AI-powered agent</p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Thinking Steps */}
        {showThinking && thinkingSteps.length > 0 && (
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-300">Agent Thinking</span>
            </div>
            {thinkingSteps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="mt-1">
                  {step.status === 'pending' && (
                    <div className="w-4 h-4 border-2 border-slate-600 rounded-full"></div>
                  )}
                  {step.status === 'in-progress' && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {step.status === 'completed' && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {step.status === 'error' && (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{step.title}</p>
                  {step.details && <p className="text-xs text-slate-400 mt-1">{step.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Start a Conversation</h2>
            <p className="text-slate-400 max-w-xs">Ask me anything. I can help with research, analysis, coding, writing, and more.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md p-6">
        <InputBar onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}
