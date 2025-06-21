'use client';

import { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Roster Frame',
    supportEmail: 'admin@rosterframe.com',
    maintenanceMode: false,
    allowRegistrations: true,
    enableNotifications: true,
    defaultShippingRate: 9.99,
    taxRate: 8.25,
    currency: 'USD'
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">⚙️ General Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Default Shipping Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.defaultShippingRate}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultShippingRate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">🎛️ Feature Controls</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">Maintenance Mode</div>
                <div className="text-sm text-slate-500">Temporarily disable public access</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">Allow New Registrations</div>
                <div className="text-sm text-slate-500">Enable new user account creation</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRegistrations}
                  onChange={(e) => setSettings(prev => ({ ...prev, allowRegistrations: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">Email Notifications</div>
                <div className="text-sm text-slate-500">Send automated emails to customers</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">ℹ️ System Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Version:</span>
                <span className="font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Environment:</span>
                <span className="font-medium">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Database:</span>
                <span className="font-medium text-green-600">Connected ✓</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Last Backup:</span>
                <span className="font-medium">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Storage Used:</span>
                <span className="font-medium">2.4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Server Status:</span>
                <span className="font-medium text-green-600">Online ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">🔧 Quick Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors">
              <span className="text-2xl">💾</span>
              <span className="font-medium">Backup Database</span>
            </button>
            <button className="flex items-center space-x-3 bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg transition-colors">
              <span className="text-2xl">🔄</span>
              <span className="font-medium">Clear Cache</span>
            </button>
            <button className="flex items-center space-x-3 bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg transition-colors">
              <span className="text-2xl">📊</span>
              <span className="font-medium">Export Data</span>
            </button>
            <button className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors">
              <span className="text-2xl">🔒</span>
              <span className="font-medium">Security Scan</span>
            </button>
            <button className="flex items-center space-x-3 bg-red-50 hover:bg-red-100 text-red-700 p-4 rounded-lg transition-colors">
              <span className="text-2xl">🗑️</span>
              <span className="font-medium">Clean Logs</span>
            </button>
            <button className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-lg transition-colors">
              <span className="text-2xl">📝</span>
              <span className="font-medium">View Logs</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
          >
            💾 Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
} 