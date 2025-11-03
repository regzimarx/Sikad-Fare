'use client';

// NOTE: Ensure this file exists and exports the gasPriceOptions array.
import { gasPriceOptions } from '../../lib/routeData'; 
import Dropdown from '../Dropdown';
import { useState } from 'react';

interface GasPriceSelectorProps {
  gasPrice: number;
  onChange: (price: number) => void;
}

export default function GasPriceSelector({ gasPrice, onChange }: GasPriceSelectorProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Sort gas prices from least to greatest
  // This uses the gasPriceOptions array imported from '../../lib/routeData'
  const sortedGasOptions = [...gasPriceOptions].sort((a, b) => Number(a.value) - Number(b.value));

  return (
    <Dropdown
      label="Gas Price"
      icon="⛽"
      value={gasPrice}
      onChange={(value) => onChange(Number(value))}
      options={sortedGasOptions} // <-- This is where the price options are passed to Dropdown
      disableSort={true}
      tooltip={
        <div className="relative flex items-center">
          {/* Info Button */}
          <button
            type="button"
            className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
            onClick={() => setIsTooltipVisible((prev) => !prev)}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Tooltip */}
          <div
            id="tooltip-gas-price"
            role="tooltip"
            className={`absolute z-10 inline-block px-4 py-3 text-sm font-semibold text-gray-800 bg-white rounded-xl shadow-lg border border-gray-200 w-48 -top-2 left-full ml-3 transition-all duration-200 transform ${
              isTooltipVisible
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-1 invisible'
            }`}
          >
            Select based on the most expensive station
            <div className="absolute w-3 h-3 bg-white border-l border-b border-gray-200 transform rotate-45 -left-1.5 top-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      }
    />
  );
}