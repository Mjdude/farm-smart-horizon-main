
import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export const NotificationsCenter: React.FC = () => {
  const notifications = [
    {
      type: 'alert',
      title: 'Pest Alert',
      message: 'Aphids detected in tomato field',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      type: 'info',
      title: 'Weather Update',
      message: 'Rain expected tomorrow morning',
      time: '4 hours ago',
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      type: 'success',
      title: 'Harvest Ready',
      message: 'Wheat field A is ready for harvest',
      time: '6 hours ago',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      type: 'info',
      title: 'Market Price',
      message: 'Wheat prices up 5% this week',
      time: '1 day ago',
      icon: Info,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          <Bell size={18} className="text-gray-400" />
          <span className="text-xs text-gray-500">{notifications.length} new</span>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const Icon = notification.icon;
          return (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${notification.bgColor} border border-gray-100`}
            >
              <div className="flex items-start space-x-3">
                <Icon size={18} className={notification.color} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {notification.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {notification.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-farm-green-600 hover:text-farm-green-700 font-medium py-2 px-4 border border-farm-green-200 rounded-lg hover:bg-farm-green-50 transition-colors duration-200">
        View All Notifications
      </button>
    </div>
  );
};
