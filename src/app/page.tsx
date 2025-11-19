'use client'

import React, { useState } from 'react';
import BottomNavbar, { NavItem } from '../components/BottomNavbar';
import StatusPage from '../components/StatusPage';
import { FaLightbulb } from 'react-icons/fa';
import SuggestionComponent from '../pages/Suggestions'; // Import the SuggestionComponent

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavItem>('suggestion');

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <StatusPage featureName="Calculator" onNavigate={setActiveTab} />;
      case 'suggestion':
        return (
          <SuggestionComponent /> // Render the SuggestionComponent
        );
      case 'security':
        return <StatusPage featureName="Security" onNavigate={setActiveTab} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-4 pb-20">{renderContent()}</main>
      <BottomNavbar activeItem={activeTab} onItemClick={setActiveTab} />
    </div>
  );
}
