
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sync URL with active section
  useEffect(() => {
    const path = location.pathname.replace('/app/', '');
    if (path && path !== activeSection) {
      setActiveSection(path);
    }
  }, [location.pathname]);

  // Update URL when section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    navigate(`/app/${section === 'dashboard' ? '' : section}`);
  };

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
          setActiveSection={handleSectionChange}
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
