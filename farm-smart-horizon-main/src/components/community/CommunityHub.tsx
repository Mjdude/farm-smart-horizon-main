
import React from 'react';
import { Users, MessageSquare, Calendar } from 'lucide-react';

export const CommunityHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">Community Hub</h1>
        <p className="text-orange-100 text-lg">Connect, learn, and share with fellow farmers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="text-orange-500" size={24} />
            <h3 className="text-lg font-semibold">Discussion Forums</h3>
          </div>
          <p className="text-gray-600 mb-4">Ask questions and share experiences</p>
          <button className="farm-button w-full">Join Discussions</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold">Expert Webinars</h3>
          </div>
          <p className="text-gray-600 mb-4">Learn from agricultural experts and professionals</p>
          <button className="farm-button w-full">Browse Events</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold">Success Stories</h3>
          </div>
          <p className="text-gray-600 mb-4">Inspiring farmer success stories and case studies</p>
          <button className="farm-button w-full">Read Stories</button>
        </div>
      </div>
    </div>
  );
};
