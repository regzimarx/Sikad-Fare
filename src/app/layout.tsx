import React from 'react';
import NavigationWrapper from '@/components/NavigationWrapper'; 
import './globals.css';

export const metadata = {
  title: 'Sikad Fare Calculator', 
  description: 'Fare Guidance for Sikad Drivers and Passengers in Midsayap, Cotabato',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavigationWrapper>
            {children}
        </NavigationWrapper>
      </body>
    </html>
  );
}