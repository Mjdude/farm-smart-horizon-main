
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CropMonitoring } from '@/components/farm/CropMonitoring';
import { MarketIntelligence } from '@/components/market/MarketIntelligence';
import { WeatherAdvisory } from '@/components/weather/WeatherAdvisory';
import { CommunityHub } from '@/components/community/CommunityHub';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { SheFarms } from '@/components/special/SheFarms';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'crop-monitoring':
        return <CropMonitoring />;
      case 'market':
        return <MarketIntelligence />;
      case 'weather':
        return <WeatherAdvisory />;
      case 'community':
        return <CommunityHub />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'she-farms':
        return <SheFarms />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
      />
      
      <div className="flex h-screen pt-16">
        <Sidebar 
          isOpen={sidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
