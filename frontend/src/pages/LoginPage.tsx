import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-blue-500">Manus</h1>
          <p className="text-center text-gray-400 mb-8">
            AI Assistant Clone
          </p>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#1f2937',
                    defaultButtonBackgroundHover: '#374151',
                    defaultButtonBorder: '#4b5563',
                    defaultButtonText: '#f3f4f6',
                    dividerBackground: '#374151',
                    focusedInputBorder: '#2563eb',
                    inputBackground: '#111827',
                    inputBorder: '#374151',
                    inputBorderFocus: '#2563eb',
                    inputBorderHover: '#4b5563',
                    inputLabelText: '#e5e7eb',
                    inputPlaceholder: '#6b7280',
                    inputText: '#f3f4f6',
                    messageText: '#d1d5db',
                    messageTextDanger: '#ef4444',
                    anchorTextColor: '#2563eb',
                    anchorTextHoverColor: '#1d4ed8',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={`${window.location.origin}/`}
          />
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
