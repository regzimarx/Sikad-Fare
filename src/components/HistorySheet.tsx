'use client';

import React from 'react';
import { HistoryEntry, PassengerType } from '../lib/types';

interface HistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  history: HistoryEntry[];
  title: string;
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
  if (quantity > 1 && (type === 'student' || type === 'senior' || type === 'regular')) {
    return `${baseString}s`;
  }
  return baseString;
};

// Helper to format timestamp into a readable date and time string
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function HistorySheet({ isOpen, onClose, onClearHistory, history, title }: HistorySheetProps) {
  return (
    <>
      {/* Backdrop for closing */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-40"
          aria-hidden="true"
        />
      )}

      {/* History Panel */}
      <div
        className={`fixed bottom-[70px] left-0 right-0 bg-gray-50 rounded-t-3xl p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{title}</h2>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="py-1 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="overflow-y-auto pt-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No history yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((item: HistoryEntry) => (
                <div key={item.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{item.routeName}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimestamp(item.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 text-right">₱{item.fare.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center text-xs text-gray-500 flex-wrap">
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