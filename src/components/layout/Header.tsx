
import React from 'react';
import { Search, Menu, Settings, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, activeSection }) => {
  const getSectionTitle = (section: string) => {
    const titles = {
      dashboard: 'Farm Dashboard',
      'crop-monitoring': 'Crop Monitoring',
      market: 'Market Intelligence',
      weather: 'Weather Advisory',
      community: 'Community Hub',
      'ai-assistant': 'AI Assistant',
      'she-farms': 'SheFarms'
    };
    return titles[section as keyof typeof titles] || 'FarmLive Innovations';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            <Menu size={20} />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-farm-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-poppins">
                FarmLive Innovations
              </h1>
              <p className="text-sm text-gray-600">{getSectionTitle(activeSection)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search farms, crops, markets..."
              className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
            />
          </div>

          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          <Button variant="ghost" size="sm">
            <Settings size={20} />
          </Button>

          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 bg-farm-green-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-farm-green-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">Rajesh Kumar</p>
              <p className="text-gray-500">Farmer</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
