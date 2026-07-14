import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';
import apiClient from '../lib/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { sessions, setSessions, setActiveSession } = useChatStore();
  const { toggleSidebar } = useUIStore();

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

  return (
    <div className="h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-500">Manus</h1>
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="m-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
      >
        + New Chat
      </button>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setActiveSession(session.id);
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-sm text-gray-300 hover:text-gray-100 truncate transition-colors"
              >
                {session.title}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm p-2">No chat sessions yet</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4 space-y-2">
        <Link
          to="/settings"
          className="block w-full text-center px-4 py-2 rounded-lg hover:bg-gray-800 text-sm text-gray-300 hover:text-gray-100 transition-colors"
        >
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg hover:bg-gray-800 text-sm text-gray-300 hover:text-gray-100 transition-colors"
        >
          Logout
        </button>
        {user && (
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        )}
      </div>
    </div>
  );
}
