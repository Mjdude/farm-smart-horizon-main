
import React from 'react';
import { Plus, Camera, Calendar, Settings } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Add Crop Record',
      description: 'Log new planting activity',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      title: 'Crop Health Check',
      description: 'Take photos for AI analysis',
      icon: Camera,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      title: 'Schedule Irrigation',
      description: 'Plan water management',
      icon: Calendar,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      textColor: 'text-white'
    },
    {
      title: 'Farm Settings',
      description: 'Update farm configuration',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white'
    },
  ];

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`${action.color} ${action.textColor} rounded-lg p-4 text-left transition-all duration-200 transform hover:scale-105 shadow-sm`}
            >
              <Icon size={24} className="mb-2" />
              <div className="text-sm font-medium">{action.title}</div>
              <div className="text-xs opacity-90 mt-1">{action.description}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-farm-green-50 border border-farm-green-200 rounded-lg">
        <div className="text-sm font-medium text-farm-green-800">Today's Recommendation</div>
        <div className="text-xs text-farm-green-700 mt-1">
          Perfect weather for pesticide application in Wheat field section A2.
        </div>
      </div>
    </div>
  );
};
