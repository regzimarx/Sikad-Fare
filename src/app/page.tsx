'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useFareCalculator } from '../hooks/useFareCalculator';
import ModeToggle from '../components/ModeToggle';

import { getFares, Fare } from '../services/fares';
import { logFareCalculation } from '../services/analytics';
import { getAppConfig, AppConfig } from '../services/config';
import { FaTimes } from 'react-icons/fa';

import { FareCalculation } from '../lib/types';
// Import the BottomNavbar and NavItem type
// import BottomNavbar, { NavItem } from '../components/BottomNavbar';

// Dynamically import MapMode to prevent SSR issues with Leaflet
const MapMode = dynamic(() => import('../components/calculator/MapMode'), {
  ssr: false,
});

import RouteMode from '../components/calculator/RouteMode';

export default function Calculator() {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const {
    state,
    setMode,
    setOrigin,
    setDestination,
    setGasPrice,
    setPassengerType,
    setHasBaggage,
    calculateFare,
    setMapResult,
    setError,
    reset,
    clearHistory
  } = useFareCalculator();

  const router = useRouter(); // Keeping router for general use, though not needed for Navbar

  // --- History Visibility Handler (Previous Fix) ---
  const handleHistoryVisibilityChange = useCallback((isVisible: boolean) => {
    setIsHistoryOpen(isVisible);
  }, []);
  
  // --- Main Calculation Handler (for Route Mode) ---
  const handleCalculate = async () => {
    // 1. Try local calculation first
    const localResult = calculateFare();

    // 2. If local succeeds, log and finish
    if (localResult) {
      logFareCalculation(state.origin, state.destination, 'route');
      return;
    }

    // 3. If local fails, try Firestore
    try {
      toast.loading("Checking for special routes...");
      const firestoreFares: Fare[] = await getFares(state.origin, state.destination);
      toast.dismiss();

      if (firestoreFares.length > 0) {
        const firestoreFare = firestoreFares[0];
        const calculatedFare: FareCalculation = {
          fare: firestoreFare.price,
          routeName: `${firestoreFare.origin} - ${firestoreFare.destination} (Special)`,
          distance: 0,
          passengerType: state.passengerType,
          gasPrice: state.gasPrice,
          hasBaggage: state.hasBaggage,
          regularFare: firestoreFare.price,
          studentFare: firestoreFare.price * 0.8,
          rateUsed: 0,
        };
        setMapResult(calculatedFare);
        logFareCalculation(state.origin, state.destination, 'route');
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error checking for special routes.");
      console.error("Firestore getFares error:", error);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col relative">
          {/* App Update Notice Banner */}
          {appConfig && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-blue-100 text-blue-800 p-3 rounded-lg shadow-lg z-[9999] flex items-center justify-between">
              <p className="text-sm font-medium">📢 {appConfig.notice}</p>
              <button onClick={() => setAppConfig(null)} className="p-1 rounded-full hover:bg-blue-200" aria-label="Dismiss notice">
                <FaTimes />
              </button>
            </div>
          )}
    
          {/* Main Content Area */}
          <>
            <div className={`px-4 pt-10 pb-10 relative z-20 ${state.mode === 'map' ? 'bg-transparent' : ''}`}>
              <ModeToggle mode={state.mode} onModeChange={setMode} />
            </div>
    
            <div className="overflow-hidden">
              {state.mode === 'route' ? (
                <RouteMode
                  state={state}
                  handlers={{
                    setOrigin,
                    setDestination,
                    setGasPrice,
                    setPassengerType,
                    setHasBaggage,
                    handleCalculate,
                    reset,
                    clearHistory,
                  }}
                  onHistoryVisibilityChange={handleHistoryVisibilityChange}
                  mode={state.mode}
                  onModeChange={setMode}
                  isHistoryOpen={isHistoryOpen}
                />
              ) : (
                <MapMode
                  gasPrice={state.gasPrice}
                  passengerType={state.passengerType}
                  hasBaggage={state.hasBaggage}
                  onGasPriceChange={setGasPrice}
                  onPassengerTypeChange={setPassengerType}
                  onBaggageChange={setHasBaggage}
                  onCalculate={setMapResult}
                  onError={setError}
                  history={state.history}
                  clearHistory={clearHistory}
                  onHistoryVisibilityChange={handleHistoryVisibilityChange}
                  mode={state.mode}
                  onModeChange={setMode}
                  isHistoryOpen={isHistoryOpen}
                />
              )}
            </div>
          </>
        </div>  );
}