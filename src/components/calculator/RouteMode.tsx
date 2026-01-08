'use client';

import React, { useState, useEffect } from 'react';
import LocationSelector from '../form/LocationSelector';
import GasPriceSelector from '../form/GasPriceSelector';
import PassengerSelector from '../form/PassengerSelector';
import BaggageSelector from '../form/BaggageSelector';
import ModeToggle from '../ModeToggle'; 
import { CalculationMode } from '../../lib/types'; 
import { midsayapProper, outsideMidsayap } from '../../lib/routeData';
import { logHistoryOpened, logHistoryCleared } from '../../services/analytics';
import { HistoryEntry, CalculatorState, PassengerType } from '../../lib/types';
import HistorySheet from '../HistorySheet';

// Define the types for the props this component will receive
interface RouteModeProps {
  state: CalculatorState; // The state object from useFareCalculator
  handlers: {
    setOrigin: (value: string) => void;
    setDestination: (value: string) => void;
    setGasPrice: (value: number) => void;
    setPassengerType: (value: Partial<PassengerType>) => void;
    setHasBaggage: (value: boolean) => void;
    handleCalculate: () => void;
    reset: () => void;
    clearHistory: () => void;
  }, // Handlers from useFareCalculator
  onHistoryVisibilityChange: (isVisible: boolean) => void; // Callback to parent for history visibility
  mode: CalculationMode; // Current calculation mode
  onModeChange: (mode: CalculationMode) => void; // Handler to change mode
  isHistoryOpen: boolean; // Prop from parent indicating if *any* history is open
}

export default function RouteMode({ state, handlers, onHistoryVisibilityChange, mode, onModeChange, isHistoryOpen }: RouteModeProps) {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  useEffect(() => {
    onHistoryVisibilityChange(isHistoryVisible);
  }, [isHistoryVisible, onHistoryVisibilityChange]);

  const getAvailableDestinations = () => {
    if (!state || !state.origin) return [];
    const isOriginProper = midsayapProper.includes(state.origin);
    const isOriginOutside = outsideMidsayap.includes(state.origin);

    if (isOriginOutside) {
      return midsayapProper;
    } else if (isOriginProper) {
      return [
        ...midsayapProper.filter(place => place !== state.origin),
        ...outsideMidsayap,
      ];
    }
    return [];
  };

  const availableDestinations = getAvailableDestinations();

  // Main container for the app's views
  return (
    <>
<div className="flex-grow flex flex-col">
        <div className="flex flex-col h-full">
          {/* Fare Display Area */}
          <div className="px-6">
            <div className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Sikad Fare
            </div>

            <div className="flex flex-col items-end justify-end">
              <div className="animate-fade-in">
                <div className="flex flex-col items-end justify-end leading-none">
                  <div className="text-7xl font-bold text-gray-800 tracking-tight flex items-end">
                    {state.result ? `₱${state.result.fare.toFixed(2)}` : '₱0.00'}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center justify-end whitespace-nowrap">
                    {state.result ? (
                      typeof state.result.distance === 'number' ? (
                        `Distance: ${state.result.distance.toFixed(2)}km`
                      ) : (
                        `Distance: ${state.result.distance}`
                      )
                    ) : (
                      'Distance: 0.00 km'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fixed Form Area Above Navbar */}
      <div className="fixed bottom-[70px] left-0 right-0 bg-gray-50 rounded-t-3xl p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t border-gray-200 z-30">
        {/* History Button - Top Right of Form */}
        <div className="absolute -top-12 left-5 z-40">
          <button
            onClick={() => {
              logHistoryOpened('route');
              setIsHistoryVisible(true);
            }}
            className="flex gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <LocationSelector label="From" icon="📍" value={state.origin} onChange={handlers.setOrigin} options={[...midsayapProper, ...outsideMidsayap]} placeholder="Select starting point..." />
            <GasPriceSelector gasPrice={state.gasPrice} onChange={handlers.setGasPrice} />
            <PassengerSelector passengerType={state.passengerType} onChange={handlers.setPassengerType} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-4">
            <LocationSelector label="To" icon="🎯" value={state.destination} onChange={handlers.setDestination} options={availableDestinations} placeholder="Select destination..." disabled={!state.origin} />
            <BaggageSelector hasBaggage={state.hasBaggage} onChange={handlers.setHasBaggage} />
            <div className="mt-auto pt-2">
              <button onClick={handlers.handleCalculate} disabled={!state.origin || !state.destination} className="w-full py-5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all shadow-md shadow-black/20 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Calculate Fare
              </button>
            </div>
          </div>
        </div>
      </div>

      <HistorySheet
        isOpen={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        onClearHistory={() => {
          logHistoryCleared();
          handlers.clearHistory();
          setIsHistoryVisible(false);
        }}
        history={state.history || []}
        title="Calculation History"
      />
    </>
  );
}