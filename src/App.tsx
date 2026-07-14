import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import ChatWindow from './pages/ChatWindow';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (import.meta.env.VITE_SUPABASE_URL === undefined && import.meta.env.VITE_SUPABASE_ANON_KEY === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white p-4">
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl border border-red-500/50 shadow-2xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Missing</h1>
          <p className="text-gray-300 mb-6">
            Your Supabase environment variables are missing. Please add them to your Vercel project settings:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-400 mb-6">
            <li><code>VITE_SUPABASE_URL</code></li>
            <li><code>VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
          <p className="text-xs text-gray-500 italic">
            Note: After adding them, you must redeploy your project on Vercel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatWindow />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
