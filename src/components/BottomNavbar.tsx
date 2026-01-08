// src/components/BottomNavbar.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaCalculator, FaLightbulb, FaFlag } from 'react-icons/fa';

// Define the possible navigation items.
// Using 'suggest' as per your required change.
export type NavItem = 'calculator' | 'suggest' | 'report'; 

interface BottomNavbarProps {
  activeItem: NavItem;
  // ⚠️ Removed onItemClick prop: Navigation is now handled internally.
}

const navItems: { id: NavItem; icon: React.ElementType; label: string }[] = [
  { id: 'calculator', icon: FaCalculator, label: 'Calculator' },
  {
    id: 'suggest', // Matches NavItem type
    icon: FaLightbulb,
    label: 'Suggest',
  },
  {
    id: 'report',
    icon: FaFlag,
    label: 'Report',
  },
];

export default function BottomNavbar({ activeItem }: BottomNavbarProps) {
  const router = useRouter(); 

  // --- FINALIZED NAVIGATION LOGIC ---
  const handleNavigation = (item: NavItem) => {
    let path = '';
    
    // Map the NavItem ID to the correct Next.js folder path
    if (item === 'calculator') {
      path = '/';          // Correct: Root path for Calculator (src/app/page.tsx)
    } else if (item === 'suggest') {
      path = '/suggest';   // Correct: Path to the suggest folder (src/app/suggest/page.tsx)
    } else if (item === 'report') {
      path = '/report';    // Correct: Path to the report folder (src/app/report/page.tsx)
    }
    
    if (path) {
      router.push(path);
    }
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-white border-t border-gray-200 flex justify-around items-center shadow-top z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          // Use the internal handler for navigation
          onClick={() => handleNavigation(item.id)} 
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