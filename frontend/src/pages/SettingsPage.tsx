import React from 'react';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/Layout';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          {/* Profile Section */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-gray-800 text-gray-400 rounded-lg px-4 py-2 border border-gray-700 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.id || ''}
                  disabled
                  className="w-full bg-gray-800 text-gray-400 rounded-lg px-4 py-2 border border-gray-700 disabled:opacity-50 font-mono text-xs"
                />
              </div>
            </div>
          </section>

          {/* Integrations Section */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Google Drive</p>
                  <p className="text-sm text-gray-400">Sync files with Google Drive</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </section>

          {/* API Keys Section */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">API Keys</h2>
            <p className="text-gray-400 text-sm mb-4">
              Manage your API keys for third-party integrations
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">
              Manage API Keys
            </button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
