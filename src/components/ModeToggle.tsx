import { CalculationMode } from '../lib/types';

interface ModeToggleProps {
  mode: CalculationMode;
  onModeChange: (mode: CalculationMode) => void;
  isHistoryOpen?: boolean;
}

export default function ModeToggle({ mode, onModeChange, isHistoryOpen = false }: ModeToggleProps) {
  return (
    <div className="relative bg-gray-100 rounded-full p-1 grid grid-cols-2 gap-1 w-max mx-auto">
      
      {/* Background slider */}
      {!isHistoryOpen && (
        <div
          className={`absolute top-1 bottom-1 bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
            mode === 'route' ? 'left-1 right-[50%]' : 'left-[50%] right-1'
          }`}
        />
      )}
      
      {/* Route Button */}
      <button
        onClick={() => onModeChange('route')}
        className={`relative z-10 py-3 px-8 rounded-full font-bold text-base transition-colors duration-300 ${
          mode === 'route' && !isHistoryOpen ? 'text-black' : 'text-gray-500'
        }`}
      >
        📍 Route
      </button>

      {/* Map Button */}
      <button
        onClick={() => onModeChange('map')}
        className={`relative z-10 py-3 px-8 rounded-full font-bold text-base transition-colors duration-300 ${
          mode === 'map' && !isHistoryOpen ? 'text-black' : 'text-gray-500'
        }`}
      >
        🗺️ Map
      </button>
    </div>
  );
}
