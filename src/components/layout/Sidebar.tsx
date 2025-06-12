
import React from 'react';
import { 
  Calendar, 
  Chart, 
  Cloud, 
  Users, 
  Settings,
  Monitor,
  User,
  Database,
  Search
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor, color: 'text-blue-600' },
    { id: 'crop-monitoring', label: 'Crop Monitoring', icon: Calendar, color: 'text-green-600' },
    { id: 'market', label: 'Market Intelligence', icon: Chart, color: 'text-purple-600' },
    { id: 'weather', label: 'Weather Advisory', icon: Cloud, color: 'text-sky-600' },
    { id: 'community', label: 'Community Hub', icon: Users, color: 'text-orange-600' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Search, color: 'text-indigo-600' },
    { id: 'she-farms', label: 'SheFarms', icon: User, color: 'text-pink-600' },
  ];

  const secondaryItems = [
    { id: 'analytics', label: 'Analytics', icon: Database, color: 'text-gray-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
  ];

  return (
    <aside className={`fixed left-0 top-16 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full nav-item ${
                isActive ? 'bg-farm-green-50 text-farm-green-700 border-r-2 border-farm-green-500' : 'text-gray-700 hover:text-farm-green-600'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-farm-green-600' : item.color} />
              {isOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
        
        {isOpen && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Tools
            </p>
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className="w-full nav-item text-gray-700 hover:text-farm-green-600"
                >
                  <Icon size={20} className={item.color} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
