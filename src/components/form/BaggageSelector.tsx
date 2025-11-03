'use client';

interface BaggageSelectorProps {
  hasBaggage: boolean;
  onChange: (hasBaggage: boolean) => void;
}

export default function BaggageSelector({ hasBaggage, onChange }: BaggageSelectorProps) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
        <span>🎒</span> Baggage
      </label>
      <label className="flex items-center gap-2 p-2 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all active:scale-[0.98] h-12">
        <input
          type="checkbox"
          checked={hasBaggage}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-black cursor-pointer rounded-sm"
        />
        <div className="flex-1">
          <div className="text-xs text-gray-600 font-semibold">Add ₱10.00 fee</div>
        </div>
      </label>
    </div>
  );
}