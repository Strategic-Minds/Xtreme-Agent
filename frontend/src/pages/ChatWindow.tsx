import React, { useEffect, useRef } from 'react';
import { useChatStore, Message } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';
import apiClient from '../lib/api';

export default function ChatWindow() {
  const { activeSessionId, messages, setMessages, addMessage, loading, setLoading } =
    useChatStore();
  const { toggleSidebar } = useUIStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendMessage = async (message: string) => {
    setLoading(true);

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };
    addMessage(userMessage);

    try {
      const response = await apiClient.post('/api/chat', {
        message,
        session_id: activeSessionId,
        stream: false,
      });

      const assistantMessage: Message = {
        id: response.data.message_id || Math.random().toString(),
        role: 'assistant',
        content: response.data.reply,
        created_at: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      // Update active session if new
      if (!activeSessionId) {
        const { setActiveSession } = useChatStore.getState();
        setActiveSession(response.data.session_id);
      }
    } catch (error) {
      console.error('Failed to send message', error);
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        created_at: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-gray-200 text-xl"
        >
          ☰
        </button>
        <h2 className="text-lg font-semibold">Chat</h2>
        <div className="w-6" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-2xl mb-2">👋</p>
              <p>Start a conversation...</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} {...msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputBar onSend={handleSendMessage} loading={loading} />
    </div>
  );
}
