'use client';

import { PassengerType, DiscountedPassenger } from '../../lib/types';
import { useState, useRef, useEffect } from 'react';

interface PassengerSelectorProps {
  passengerType: PassengerType;
  onChange: (type: Partial<PassengerType>) => void;
}

type SelectablePassengerType = PassengerType['type'];

const passengerTypeOptions: { value: SelectablePassengerType; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'pwd', label: 'PWD' },
  { value: 'senior', label: 'Senior' },
  { value: 'regular', label: 'Regular' },
];

export default function PassengerSelector({ passengerType, onChange }: PassengerSelectorProps) { 
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 400);
  };

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOpen) {
      e.stopPropagation(); 
      closeDropdown();
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && isOpen) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1) onChange({ quantity: newQty });
  };

  const handleTypeSelect = (type: SelectablePassengerType) => {
    onChange({ type });
    closeDropdown();
  };

  return (
    <div className="group" ref={dropdownRef}>
      <label className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5 transition-colors group-focus-within:text-gray-900">
        <span className="text-sm opacity-70">👤</span>
        Passenger
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full px-4 py-3 text-sm font-medium border border-gray-200 rounded-lg bg-white text-left flex items-center justify-between transition-all duration-200 cursor-pointer hover:border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 ${
            isOpen && !isClosing ? 'border-gray-900 ring-2 ring-gray-900/5' : ''
          }`}
        >
          <span className="truncate text-gray-900 flex items-center gap-1.5">
            <span className="font-semibold">{passengerType.quantity} </span>
            <span className="text-gray-300 font-normal">|</span>
            <span className="truncate">
              {passengerTypeOptions.find(o => o.value === passengerType.type)?.label || 'Regular'}
            </span>
          </span>

          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
              isOpen && !isClosing ? 'rotate-180' : ''
            }`}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        {(isOpen || isClosing) && (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/40 ${
                isClosing ? 'animate-fade-out' : 'animate-fade-in'
              }`}
              onClick={closeDropdown}
            />

            <div
              className={`fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-2xl bg-white shadow-lg ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
            >
              <div className="p-4 border-b border-gray-200 text-center">
                <h3 className="font-semibold text-gray-800">Passenger</h3>
              </div>

              <div className="p-6 pb-24">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Number of Passengers
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(passengerType.quantity - 1)}
                      disabled={passengerType.quantity <= 1}
                      className="w-12 h-12 rounded-lg bg-gray-100 text-gray-700 font-bold text-xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <div className="w-20 h-12 rounded-lg bg-gray-900 text-white font-bold text-2xl flex items-center justify-center">
                      {passengerType.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(passengerType.quantity + 1)}
                      className="w-12 h-12 rounded-lg bg-gray-100 text-gray-700 font-bold text-xl hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Passenger Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {passengerTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleTypeSelect(option.value)}
                        className={`px-4 py-4 text-sm font-medium text-left rounded-lg transition-all ${
                          passengerType.type === option.value
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-xs">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}