// src/components/NavigationWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import BottomNavbar, { NavItem } from './BottomNavbar';
import React from 'react';

const getActiveItem = (currentPath: string): NavItem => {
    if (!currentPath) return 'calculator'; 
    if (currentPath.startsWith('/suggest')) return 'suggest';
    if (currentPath.startsWith('/report')) return 'report';
    return 'calculator'; 
};

interface NavigationWrapperProps {
    children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) { 
    const pathname = usePathname();
    const activeItem = getActiveItem(pathname || '/');

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow pb-[70px]"> 
                {children}
            </main>

            <BottomNavbar activeItem={activeItem} />
        </div>
    );
}