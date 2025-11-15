'use client';

import React, { useState } from 'react';
import LocationSelector from '../form/LocationSelector';
import GasPriceSelector from '../form/GasPriceSelector';
import PassengerSelector from '../form/PassengerSelector';
import BaggageSelector from '../form/BaggageSelector';
import { midsayapProper, outsideMidsayap } from '../../lib/routeData';
import { HistoryEntry, CalculatorState, PassengerType } from '../../lib/types';

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
  };
}

// Helper to format passenger type for display
const formatPassengerType = (type: PassengerType['type'], quantity: number) => {
  const typeMap: Record<PassengerType['type'], string> = {
    regular: 'Regular',
    student: 'Student',
    senior: 'Senior',
    pwd: 'PWD',
  };

  const baseString = typeMap[type] || 'Unknown';

  // Only pluralize 'student' and 'senior'
  if (quantity > 1 && (type === 'student' || type === 'senior')) {
    return `${baseString}s`; // e.g., Students, Seniors
  }
  return baseString; // e.g., Regular, PWD
};

export default function RouteMode({ state, handlers }: RouteModeProps) {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

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
      <div className="flex-grow flex flex-col overflow-y-auto pb-[260px]">
        <div className="flex flex-col h-full">
          {/* Fare Display Area */}
          <div className="px-6 pb-3">
            <div className="text-right text-sm font-bold text-gray-500 uppercase tracking-wider">
              Sikad Fare
            </div>

            <div className="flex flex-col items-end justify-end mt-1">
              <div className="animate-fade-in">
                <div className="flex flex-col items-end justify-end leading-none">
                  <div className="text-7xl font-bold text-gray-800 tracking-tight h-[80px] flex items-end">
                    {state.result ? `₱${state.result.fare.toFixed(2)}` : '₱0.00'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 h-[22px] flex items-center justify-end whitespace-nowrap">
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
          {/* Spacer so content doesn't overlap fixed form */}
          <div className="flex-grow" />
        </div>
      </div>

      {/* Fixed Form Area Above Navbar */}
      <div className="fixed bottom-[70px] left-0 right-0 bg-gray-50 rounded-t-3xl p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t border-gray-200 z-30">
        {/* History Button - Top Right of Form */}
        <div className="absolute -top-12 left-5 z-40">
          <button
            onClick={() => setIsHistoryVisible(true)}
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

      {/* History Sheet */}
      {/* Backdrop for closing */}
      {isHistoryVisible && (
        <div
          onClick={() => setIsHistoryVisible(false)}
          className="fixed inset-0 bg-black/20 z-40"
        />
      )}
      <div
        className={`fixed bottom-[70px] left-0 right-0 bg-gray-50 rounded-t-3xl p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isHistoryVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Calculation History</h2>
          {(state.history || []).length > 0 && (
            <button
              onClick={() => {
                handlers.clearHistory();
                setIsHistoryVisible(false);
              }}
              className="py-1 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="max-h-[340px] overflow-y-auto pt-4">
          {(state.history || []).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No history yet.</p>
          ) : (
            <div className="space-y-4">
              {state.history.map((item: HistoryEntry) => (
                <div key={item.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800 text-base">{item.routeName}</p>
                    <p className="text-lg font-bold text-gray-900">₱{item.fare.toFixed(2)}</p>
                  </div>
                  <div className="mt-1.5 flex items-center text-xs text-gray-500">
                    <span title="Passenger Type & Quantity" className="flex items-center">
                      👤 {item.passengerType.quantity} {formatPassengerType(item.passengerType.type, item.passengerType.quantity)}
                    </span>
                    <span className="mx-2">&middot;</span>
                    <span title="Gas Price" className="flex items-center">
                      ⛽ ₱{item.gasPrice.toFixed(2)}/L
                    </span>
                    <span className="mx-2">&middot;</span>
                    <span title="Baggage Included" className="flex items-center">
                      🧳 {item.hasBaggage ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}