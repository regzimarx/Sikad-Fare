'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BottomNavbar, { NavItem } from '../components/BottomNavbar';
import './globals.css'; // Assuming you have a global CSS file

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Handle the case where pathname is null during initial render or hydration
  if (pathname === null) {
    return (
      <html lang="en">
        <body>{children}</body> {/* Or a loading spinner */}
      </html>
    );
  }

  const router = useRouter();

  // Don't render the layout for the root page, as it just redirects.
  if (pathname === '/') {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  // Safely determine the active nav item by checking the start of the path.
  // This handles nested routes (e.g., /suggest/new) correctly.
  const getActiveItem = (currentPath: string): NavItem => {
    if (currentPath.startsWith('/suggestion')) return 'suggestion';
    if (currentPath.startsWith('/report')) return 'report';
    // Default to calculator for any other path, including '/calculator'
    return 'calculator';
  };

  const handleNavItemClick = (item: NavItem) => {
    router.push(`/${item}`);
  };

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow pb-20 h-screen">{children}</main>
          <BottomNavbar activeItem={getActiveItem(pathname)} onItemClick={handleNavItemClick} />
        </div>
      </body>
    </html>
  );
}