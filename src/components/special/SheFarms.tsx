
import React from 'react';
import { Users, Star, Heart } from 'lucide-react';

export const SheFarms: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">SheFarms Platform</h1>
        <p className="text-pink-100 text-lg">Empowering women farmers with dedicated resources and community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="text-pink-500" size={24} />
            <h3 className="text-lg font-semibold">Women's Community</h3>
          </div>
          <p className="text-gray-600 mb-4">Connect with fellow women farmers and entrepreneurs</p>
          <button className="farm-button w-full">Join Community</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="text-yellow-500" size={24} />
            <h3 className="text-lg font-semibold">Success Stories</h3>
          </div>
          <p className="text-gray-600 mb-4">Inspiring stories from women leading in agriculture</p>
          <button className="farm-button w-full">Read Stories</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="text-red-500" size={24} />
            <h3 className="text-lg font-semibold">Mentorship Program</h3>
          </div>
          <p className="text-gray-600 mb-4">Find mentors and support for your farming journey</p>
          <button className="farm-button w-full">Find Mentor</button>
        </div>
      </div>
    </div>
  );
};
