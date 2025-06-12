
import React from 'react';
import { Clock, Leaf, Droplets, Settings, Camera } from 'lucide-react';

export const RecentActivities: React.FC = () => {
  const activities = [
    {
      action: 'Wheat harvest completed',
      field: 'Field A',
      time: '2 hours ago',
      icon: Leaf,
      color: 'text-green-500'
    },
    {
      action: 'Irrigation system activated',
      field: 'Corn field B',
      time: '4 hours ago',
      icon: Droplets,
      color: 'text-blue-500'
    },
    {
      action: 'Pest monitoring photos uploaded',
      field: 'Tomato greenhouse',
      time: '6 hours ago',
      icon: Camera,
      color: 'text-purple-500'
    },
    {
      action: 'Fertilizer application scheduled',
      field: 'Onion field C',
      time: '8 hours ago',
      icon: Settings,
      color: 'text-orange-500'
    },
    {
      action: 'Soil moisture sensor calibrated',
      field: 'Field A',
      time: '1 day ago',
      icon: Settings,
      color: 'text-gray-500'
    }
  ];

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <Clock size={18} className="text-gray-400" />
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {activity.action}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {activity.field}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {activity.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-farm-green-600 hover:text-farm-green-700 font-medium py-2 px-4 border border-farm-green-200 rounded-lg hover:bg-farm-green-50 transition-colors duration-200">
        View Activity Log
      </button>
    </div>
  );
};
