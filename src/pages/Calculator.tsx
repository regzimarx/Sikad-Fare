"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useFareCalculator } from '../hooks/useFareCalculator';
import ModeToggle from '../components/ModeToggle';
import BottomNavbar, { NavItem } from '../components/BottomNavbar';

import { getFares, Fare } from '../services/fares';
import { logFareCalculation } from '../services/analytics';
import { getAppConfig, AppConfig } from '../services/config';
import { FaTimes } from 'react-icons/fa';

import { FareCalculation } from '../lib/types';

// Dynamically import MapMode to prevent SSR issues with Leaflet
const MapMode = dynamic(() => import('../components/calculator/MapMode'), {
  ssr: false,
});

// RouteMode is a simpler component, import directly
import RouteMode from '../components/calculator/RouteMode';

export default function Calculator() {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  const [activeTab, setActiveTab] = useState<NavItem>('calculator');
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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getAppConfig();
        if (config && config.notice) {
          setAppConfig(config);
        }
      } catch (error) {
        console.error("Could not fetch app config:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleCalculate = async () => {
    const localResult = calculateFare();

    if (localResult) {
      logFareCalculation(state.origin, state.destination, 'route');
      return;
    }

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
    <div className="h-screen bg-white flex flex-col relative overflow-hidden">
      {appConfig && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-blue-100 text-blue-800 p-3 rounded-lg shadow-lg z-[9999] flex items-center justify-between">
          <p className="text-sm font-medium">📢 {appConfig.notice}</p>
          <button onClick={() => setAppConfig(null)} className="p-1 rounded-full hover:bg-blue-200" aria-label="Dismiss notice">
            <FaTimes />
          </button>
        </div>
      )}

      <>
        <div className={`p-4 pt-8 relative z-20 ${state.mode === 'map' ? 'bg-transparent' : ''}`}>
          <ModeToggle mode={state.mode} onModeChange={setMode} />
        </div>

        {state.mode === 'route' ? (
          <RouteMode
            state={state}
            handlers={{ setOrigin, setDestination, setGasPrice, setPassengerType, setHasBaggage, handleCalculate, reset, clearHistory }}
            onHistoryVisibilityChange={setIsHistoryOpen}
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
            onHistoryVisibilityChange={setIsHistoryOpen}
            mode={state.mode}
            onModeChange={setMode}
            isHistoryOpen={isHistoryOpen}
          />
        )}
      </>

      <div className="z-50">
        <BottomNavbar activeItem={activeTab} />
      </div>
    </div>
  );
}
