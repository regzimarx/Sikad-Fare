'use client'

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import BottomNavbar, { NavItem } from '../components/BottomNavbar';
import Calculator from '../pages/Calculator';
import ComingSoon from '../components/ComingSoon';

import SuggestionComponent from '../pages/Suggestions'; 

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavItem>('calculator');

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <Calculator />;
      case 'suggestion':
        return (
          <SuggestionComponent /> // Render the SuggestionComponent
        );
      case 'security': // Render the ComingSoon component for the 'security' tab
        return <ComingSoon featureName="Security" onNavigate={setActiveTab} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-20 h-screen">{renderContent()}</main>
      <BottomNavbar 
        activeItem={activeTab} 
        onItemClick={(item) => {
          if (item === 'security') {
            toast('Coming soon!');
          } else {
            setActiveTab(item);
          }
        }} 
      />
    </div>
  );
}
