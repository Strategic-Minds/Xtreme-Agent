import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';
import apiClient from '../lib/api';

interface Task {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  timestamp: number;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { sessions, setSessions, setActiveSession, activeSessionId } = useChatStore();
  const { toggleSidebar, sidebarOpen } = useUIStore();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await apiClient.get('/api/chat/sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  const handleNewChat = () => {
    setActiveSession(null);
    navigate('/');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId);
    navigate('/');
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 flex flex-col transition-all duration-300 ${
      sidebarOpen ? 'w-64' : 'w-0'
    } overflow-hidden z-40`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Manus</h1>
              <p className="text-xs text-slate-400">Assistant</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="m-4 w-auto mx-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-4 py-2.5 font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2 flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {/* Active Tasks */}
        {tasks.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Active Tasks</h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-lg hover:bg-slate-800/60 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : task.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Sessions */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Recent Chats</h3>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500 px-2">No chats yet. Start a new conversation!</p>
            ) : (
              sessions.map((session: any) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    activeSessionId === session.id
                      ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100'
                      : 'bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{session.title || 'Untitled Chat'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md flex-shrink-0 space-y-3">
        <Link
          to="/settings"
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
        {user && (
          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 truncate">Logged in as</p>
            <p className="text-sm font-medium text-slate-300 truncate">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
