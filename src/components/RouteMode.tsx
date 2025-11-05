'use client';

import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useFareCalculator } from '../hooks/useFareCalculator';
import BottomNavbar from './BottomNavbar';
import ModeToggle from './ModeToggle';
import FareResult from './FareResult';
import LocationSelector from './form/LocationSelector';
import GasPriceSelector from './form/GasPriceSelector';
import PassengerSelector from './form/PassengerSelector';
import BaggageSelector from './form/BaggageSelector';
import { midsayapProper, outsideMidsayap } from '../lib/routeData';

const MapMode = dynamic(() => import('./MapMode'), {
  ssr: false,
});

export default function FareCalculator() {
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
    reset
  } = useFareCalculator();

  const handleCalculate = () => {
    calculateFare();
  };

  const getAvailableDestinations = () => {
    if (!state.origin) return [];
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

  return (
    <div className="h-screen bg-white flex flex-col relative overflow-hidden">
      <div className="flex-grow flex flex-col overflow-y-auto pb-[260px]">
        {/* Top Mode Toggle */}
        <div className="p-4 pt-8 relative z-50">
          <ModeToggle mode={state.mode} onModeChange={setMode} />
        </div>

        {state.mode === 'route' ? (
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
                      {state.result
                        ? `₱${state.result.fare.toFixed(2)}`
                        : '₱0.00'}
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
        ) : (
          <div className="p-4 pt-0 h-full">
            <MapMode
              gasPrice={state.gasPrice}
              passengerType={state.passengerType}
              hasBaggage={state.hasBaggage}
              onGasPriceChange={setGasPrice}
              onPassengerTypeChange={setPassengerType}
              onBaggageChange={setHasBaggage}
              onCalculate={setMapResult}
              onError={setError}
            />
            {state.result && (
              <div className="mt-4">
                <FareResult result={state.result} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Form Area Above Navbar */}
      {state.mode === 'route' && (
        <div className="fixed bottom-[70px] left-0 right-0 bg-gray-50 rounded-t-3xl p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t border-gray-200 z-30">
          {/* History Button - Top Right of Form */}
          <div className="absolute -top-12 left-5 z-40">
            <button
              onClick={() => toast('Coming soon!')}
              className="flex gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-black"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>History</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <LocationSelector
                label="From"
                icon="📍"
                value={state.origin}
                onChange={setOrigin}
                options={[...midsayapProper, ...outsideMidsayap]}
                placeholder="Select starting point..."
              />
              <GasPriceSelector gasPrice={state.gasPrice} onChange={setGasPrice} />
              <PassengerSelector
                passengerType={state.passengerType}
                onChange={setPassengerType}
              />
            </div>

            {/* Right Column */}
            <div className="flex flex-col space-y-4">
              <LocationSelector
                label="To"
                icon="🎯"
                value={state.destination}
                onChange={setDestination}
                options={availableDestinations}
                placeholder="Select destination..."
                disabled={!state.origin}
              />
              <BaggageSelector
                hasBaggage={state.hasBaggage}
                onChange={setHasBaggage}
              />
              <div className="mt-auto pt-2">
                <button
                  onClick={handleCalculate}
                  disabled={!state.origin || !state.destination}
                  className="w-full py-5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all shadow-md shadow-black/20 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Calculate Fare
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="z-50">
        <BottomNavbar
          activeItem="calculator"
          onItemClick={(item) => {
            if (item !== 'calculator') toast('Coming soon!');
          }}
        />
      </div>
    </div>
  );
}