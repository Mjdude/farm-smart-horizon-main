
import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const CropHealth: React.FC = () => {
  const healthData = [
    {
      crop: 'Wheat (Field A)',
      status: 'excellent',
      health: 95,
      issue: 'No issues detected',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      crop: 'Corn (Field B)',
      status: 'good',
      health: 82,
      issue: 'Slight nutrient deficiency',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      crop: 'Tomatoes (Greenhouse)',
      status: 'attention',
      health: 68,
      issue: 'Pest activity detected',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      crop: 'Onions (Field C)',
      status: 'excellent',
      health: 91,
      issue: 'Optimal growth conditions',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Crop Health Monitor</h3>
        <span className="text-xs text-gray-500">Live Status</span>
      </div>

      <div className="space-y-3">
        {healthData.map((crop, index) => {
          const Icon = crop.icon;
          return (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${crop.bgColor} ${crop.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon size={20} className={crop.color} />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{crop.crop}</div>
                    <div className="text-xs text-gray-600">{crop.issue}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{crop.health}%</div>
                  <div className="text-xs text-gray-500">Health</div>
                </div>
              </div>
              
              {/* Health Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      crop.health >= 90 ? 'bg-green-500' : 
                      crop.health >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${crop.health}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 bg-farm-green-500 hover:bg-farm-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
        View Detailed Analysis
      </button>
    </div>
  );
};
