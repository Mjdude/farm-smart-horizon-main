
import React from 'react';
import { Cloud, Sun, AlertTriangle } from 'lucide-react';

export const WeatherAdvisory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500 to-sky-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold font-poppins mb-2">Weather Advisory Center</h1>
        <p className="text-sky-100 text-lg">Hyperlocal forecasts and agricultural weather insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Sun className="text-yellow-500" size={24} />
            <h3 className="text-lg font-semibold">7-Day Forecast</h3>
          </div>
          <p className="text-gray-600 mb-4">Detailed weather predictions for farm planning</p>
          <button className="farm-button w-full">View Forecast</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h3 className="text-lg font-semibold">Weather Alerts</h3>
          </div>
          <p className="text-gray-600 mb-4">Early warning system for extreme weather</p>
          <button className="farm-button w-full">Manage Alerts</button>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3 mb-4">
            <Cloud className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold">Crop Recommendations</h3>
          </div>
          <p className="text-gray-600 mb-4">Weather-based farming recommendations</p>
          <button className="farm-button w-full">Get Advice</button>
        </div>
      </div>
    </div>
  );
};
