import { FareCalculation } from '../lib/types';

interface FareResultProps {
  result: FareCalculation;
}

export default function FareResult({ result }: FareResultProps) {
  return (
    <div className="mt-6 animate-slide-up">
      {/* Fare Amount Card */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center shadow-2xl mb-4">
        <div className="text-sm uppercase tracking-wider opacity-90 mb-2 font-semibold">
          Your Fare
        </div>
        <div className="text-8xl font-black my-6 drop-shadow-lg">
          ₱{result.fare.toFixed(2)}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm opacity-90">
          <span>💳</span>
          <span>Pay this amount to your driver</span>
        </div>
      </div>

      {/* Trip Details Card */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4 flex items-center gap-2">
          <span>📋</span> Trip Details
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="text-xl">🛣️</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-semibold mb-1">Route</div>
              <div className="font-bold text-gray-900 text-sm break-words">{result.routeName}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="text-xl mb-1">📏</div>
              <div className="text-xs text-blue-600 font-semibold mb-1">Distance</div>
              <div className="font-bold text-gray-900 text-sm">
                {typeof result.distance === 'number'
                  ? `${result.distance.toFixed(2)} km`
                  : result.distance}
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="text-xl mb-1">👤</div>
              <div className="text-xs text-purple-600 font-semibold mb-1">Type</div>
              <div className="font-bold text-gray-900 text-sm">
                {result.passengerType.type === 'student' ? 'Student' : 'Regular'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
            <div className="text-xl">⛽</div>
            <div className="flex-1">
              <div className="text-xs text-yellow-700 font-semibold mb-1">Gas Price</div>
              <div className="font-bold text-gray-900 text-sm">₱{result.gasPrice.toFixed(2)}/L</div>
            </div>
          </div>

          {result.hasBaggage && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <div className="text-xl">🎒</div>
              <div className="flex-1">
                <div className="text-xs text-orange-700 font-semibold mb-1">Baggage Fee</div>
                <div className="font-bold text-gray-900 text-sm">₱10.00</div>
              </div>
            </div>
          )}

          {result.rateUsed && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
              <div className="text-xl">💰</div>
              <div className="flex-1">
                <div className="text-xs text-indigo-700 font-semibold mb-1">Rate Used</div>
                <div className="font-bold text-gray-900 text-sm">₱{result.rateUsed.toFixed(2)}/km</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}