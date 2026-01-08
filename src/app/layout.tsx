import React from 'react';
import NavigationWrapper from '@/components/NavigationWrapper'; 
import SupportButton from '@/components/SupportButton';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

export const metadata = {
  title: 'Sikad Fare Calculator', 
  description: 'Fare Guidance for Sikad Drivers and Passengers in Midsayap, Cotabato',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <NavigationWrapper>
              {children}
          </NavigationWrapper>
        </main>
        <SupportButton />
        <PwaInstallPrompt />
        <Toaster 
          containerStyle={{
            zIndex: 99999, // Force it to be above everything else
          }}
        />
      </body>
    </html>
  );
}