
import React from 'react';
import { Camera, MapPin, Calendar, TrendingUp } from 'lucide-react';

export const CropMonitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">Crop Monitoring System</h1>
        <p className="text-green-100 text-lg">AI-powered crop health analysis and field management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Camera className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold">Photo Analysis</h3>
          </div>
          <p className="text-gray-600 mb-4">Upload crop images for AI-powered disease detection</p>
          <button className="farm-button w-full">Upload Photos</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold">Field Mapping</h3>
          </div>
          <p className="text-gray-600 mb-4">Interactive maps with crop status indicators</p>
          <button className="farm-button w-full">View Maps</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold">Growth Tracking</h3>
          </div>
          <p className="text-gray-600 mb-4">Monitor crop development and yield predictions</p>
          <button className="farm-button w-full">View Analytics</button>
        </div>
      </div>
    </div>
  );
};
