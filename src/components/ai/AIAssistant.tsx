
import React from 'react';
import { Search, MessageSquare, Camera } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">AI Farm Assistant</h1>
        <p className="text-indigo-100 text-lg">Intelligent support for all your farming decisions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="text-indigo-500" size={24} />
            <h3 className="text-lg font-semibold">Chat Assistant</h3>
          </div>
          <p className="text-gray-600 mb-4">Get instant answers to farming questions</p>
          <button className="farm-button w-full">Start Chat</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Camera className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold">Image Analysis</h3>
          </div>
          <p className="text-gray-600 mb-4">AI-powered crop and pest identification</p>
          <button className="farm-button w-full">Analyze Photos</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold">Smart Recommendations</h3>
          </div>
          <p className="text-gray-600 mb-4">Personalized farming advice and insights</p>
          <button className="farm-button w-full">Get Recommendations</button>
        </div>
      </div>
    </div>
  );
};
