'use client';

import React from 'react';
import { FaCalculator, FaLightbulb, FaFlag } from 'react-icons/fa';

// Define the possible navigation items. This makes it easy to add/remove tabs in the future.
export type NavItem = 'calculator' | 'suggestion' | 'report';

interface BottomNavbarProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
}

const navItems: { id: NavItem; icon: React.ElementType; label: string }[] = [
  { id: 'calculator', icon: FaCalculator, label: 'Calculator' },
  {
    id: 'suggestion',
    icon: FaLightbulb, // Using a more appropriate icon for suggestions
    label: 'Suggest',
  },
  {
    id: 'report',
    icon: FaFlag, // Using a flag icon for reporting
    label: 'Report',
  },
];

export default function BottomNavbar({ activeItem, onItemClick }: BottomNavbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-white border-t border-gray-200 flex justify-around items-center shadow-top z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            activeItem === item.id ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          <item.icon className="text-2xl" />
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
