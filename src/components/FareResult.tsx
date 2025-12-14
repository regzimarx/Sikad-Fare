"use client";
import { useState } from 'react';
import { FareCalculation } from '../lib/types';

interface FareResultProps {
  result: FareCalculation;
}

export default function FareResult({ result }: FareResultProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`relative mt-6 transition-all duration-500 ease-in-out mx-auto ${showDetails ? 'max-w-4xl' : 'max-w-sm'}`}>
      
      {/* Flex Container to hold both cards side-by-side on desktop */}
      <div className="flex flex-col md:flex-row items-stretch gap-4">
        
        {/* === CARD 1: FARE RESULT (Gradient Background) === */}
        <div className={`
          relative z-10 flex-shrink-0
          bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 
          text-white text-center shadow-2xl 
          rounded-3xl p-6 md:p-8 
          flex flex-col items-center justify-center
          transition-all duration-500
          ${showDetails ? 'w-full md:w-80' : 'w-full'}
        `}>
          <div className="text-xs md:text-sm uppercase tracking-wider opacity-90 mb-2 font-semibold">
            Your Fare
          </div>
          
          {/* Responsive Text Size: 6xl on mobile, 8xl on desktop */}
          <div className="text-5xl md:text-7xl font-black my-4 md:my-6 drop-shadow-lg transition-all duration-300">
            ₱{result.fare.toFixed(2)}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm opacity-90">
            <span>💳</span>
            <span>Pay this amount to your driver</span>
          </div>
          
          <div className="mt-6 md:mt-8 w-full">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm md:text-base font-bold text-white bg-white/20 hover:bg-white/30 transition-all rounded-xl px-4 py-3 border border-white/10"
            >
              {showDetails ? 'Close Details' : 'See Details'}
            </button>
          </div>
        </div>

        {/* === CARD 2: DETAILS PANEL (White Background) === */}
        <div className={`
          flex-1 bg-white rounded-3xl p-5 md:p-6 shadow-xl border border-gray-100
          transition-all duration-500 ease-in-out origin-top md:origin-left
          ${showDetails 
            ? 'opacity-100 translate-y-0 md:translate-x-0 max-h-[800px]' 
            : 'opacity-0 -translate-y-4 md:translate-y-0 md:-translate-x-4 max-h-0 overflow-hidden hidden'
          }
        `}>
          <div className="text-xs md:text-sm uppercase tracking-wider text-gray-500 font-bold mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span>📋</span> Trip Details
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="text-xl md:text-2xl">🛣️</div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] md:text-xs text-gray-500 font-semibold mb-1">Route</div>
                <div className="font-bold text-gray-900 text-sm md:text-base break-words leading-tight">
                  {result.routeName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="text-xl md:text-2xl mb-1">📏</div>
                <div className="text-[10px] md:text-xs text-blue-600 font-semibold mb-1">Distance</div>
                <div className="font-bold text-gray-900 text-sm md:text-base">
                  {typeof result.distance === 'number'
                    ? `${result.distance.toFixed(2)} km`
                    : result.distance}
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <div className="text-xl md:text-2xl mb-1">👤</div>
                <div className="text-[10px] md:text-xs text-purple-600 font-semibold mb-1">Type</div>
                <div className="font-bold text-gray-900 text-sm md:text-base">
                  {result.passengerType.type === 'student' ? 'Student' : 'Regular'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
              <div className="text-xl md:text-2xl">⛽</div>
              <div className="flex-1">
                <div className="text-[10px] md:text-xs text-yellow-700 font-semibold mb-1">Gas Price</div>
                <div className="font-bold text-gray-900 text-sm md:text-base">₱{result.gasPrice.toFixed(2)}/L</div>
              </div>
            </div>

            {result.hasBaggage && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <div className="text-xl md:text-2xl">🎒</div>
                <div className="flex-1">
                  <div className="text-[10px] md:text-xs text-orange-700 font-semibold mb-1">Baggage Fee</div>
                  <div className="font-bold text-gray-900 text-sm md:text-base">₱10.00</div>
                </div>
              </div>
            )}

            {result.rateUsed && (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                <div className="text-xl md:text-2xl">💰</div>
                <div className="flex-1">
                  <div className="text-[10px] md:text-xs text-indigo-700 font-semibold mb-1">Rate Used</div>
                  <div className="font-bold text-gray-900 text-sm md:text-base">₱{result.rateUsed.toFixed(2)}/km</div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      
      {/* Helper text for click-to-exit */}
      <div 
        onClick={() => setShowDetails(false)}
        className={`text-center mt-4 text-[10px] md:text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors ${!showDetails ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        Click here to close details
      </div>
    </div>
  );
}