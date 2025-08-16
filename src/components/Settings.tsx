import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Zap, Bell, Shield, Download, Upload, ExternalLink } from 'lucide-react';

export default function Settings() {
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [notifications, setNotifications] = useState({
    scoreAlerts: true,
    dailyDigest: true,
    lowScoreWarnings: true,
    newLeadAlerts: false
  });

  const [scoreThresholds, setScoreThresholds] = useState({
    excellent: 80,
    good: 60,
    poor: 40
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your Vibe Check Lead Scorer preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HubSpot Integration */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            HubSpot Integration
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-white">Connection Status</div>
                <div className={`text-sm ${hubspotConnected ? 'text-green-400' : 'text-gray-400'}`}>
                  {hubspotConnected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              <button
                onClick={() => setHubspotConnected(!hubspotConnected)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hubspotConnected 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {hubspotConnected ? 'Disconnect' : 'Connect HubSpot'}
              </button>
            </div>

            {hubspotConnected && (
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Sync Frequency:</span>
                  <span className="text-blue-400">Every 15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span className="text-green-400">2 minutes ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Synced Contacts:</span>
                  <span className="text-white">1,247</span>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-400">
              Connect your HubSpot account to automatically sync lead data and push vibe scores back to your CRM.
            </div>

            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
              <ExternalLink className="w-4 h-4" />
              View Integration Documentation
            </button>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Sentiment Engine
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sentiment Analysis Provider
              </label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                <option>OpenAI GPT-4</option>
                <option>Google Cloud Natural Language</option>
                <option>Custom Model</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Processing Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="processing" defaultChecked className="text-blue-600" />
                  <span className="ml-2 text-gray-300">Real-time (recommended)</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="processing" className="text-blue-600" />
                  <span className="ml-2 text-gray-300">Batch (hourly)</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-sm font-medium text-white mb-1">API Usage Today</div>
              <div className="text-2xl font-bold text-blue-400">2,847 / 10,000</div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                <div className="bg-blue-400 h-1 rounded-full" style={{ width: '28.47%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Thresholds */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Score Thresholds
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excellent Score Threshold: {scoreThresholds.excellent}
              </label>
              <input
                type="range"
                min="70"
                max="100"
                value={scoreThresholds.excellent}
                onChange={(e) => setScoreThresholds(prev => ({ ...prev, excellent: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Good Score Threshold: {scoreThresholds.good}
              </label>
              <input
                type="range"
                min="40"
                max="80"
                value={scoreThresholds.good}
                onChange={(e) => setScoreThresholds(prev => ({ ...prev, good: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poor Score Threshold: {scoreThresholds.poor}
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={scoreThresholds.poor}
                onChange={(e) => setScoreThresholds(prev => ({ ...prev, poor: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="text-sm text-gray-400">
              Adjust these thresholds to match your sales team's qualification criteria.
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-sm text-gray-400">
                    {key === 'scoreAlerts' && 'Get notified when lead scores change significantly'}
                    {key === 'dailyDigest' && 'Receive daily summary of lead activity'}
                    {key === 'lowScoreWarnings' && 'Alert when leads fall below poor threshold'}
                    {key === 'newLeadAlerts' && 'Notification for new lead additions'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export Lead Data
          </button>
          
          <button className="flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Upload className="w-5 h-5" />
            Import Lead Data
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Export your lead data and vibe scores in CSV format, or bulk import new leads from your existing systems.
        </div>
      </div>
    </div>
  );
}