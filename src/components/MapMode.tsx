'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapMarker, PassengerType } from '../lib/types';
import { calculateMapFare, haversineDistance } from '../lib/fareCalculations';
import GasPriceSelector from './form/GasPriceSelector';
import toast from 'react-hot-toast';

interface MapModeProps {
  gasPrice: number;
  passengerType: PassengerType;
  hasBaggage: boolean;
  onGasPriceChange: (price: number) => void;
  onPassengerTypeChange: (type: Partial<PassengerType>) => void;
  onBaggageChange: (hasBaggage: boolean) => void;
  onCalculate: (result: any) => void;
  onError: (error: string) => void;
}

export default function MapMode({
  gasPrice,
  passengerType,
  hasBaggage,
  onGasPriceChange,
  onPassengerTypeChange,
  onBaggageChange,
  onCalculate,
  onError,
}: MapModeProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [originMarker, setOriginMarker] = useState<L.Marker | null>(null);
  const [destMarker, setDestMarker] = useState<L.Marker | null>(null);
  const [routeLine, setRouteLine] = useState<L.Polyline | null>(null);
  const [setOriginMode, setSetOriginMode] = useState(false);
  const [mapStats, setMapStats] = useState({ rateUsed: 0, estimatedDist: 0 });

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([7.2320, 124.3650], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Check if map still exists before using it
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
          }
          
          // Ensure map still exists before adding marker
          if (mapRef.current) {
            const marker = L.marker([latitude, longitude], {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              }),
              draggable: true
            }).addTo(mapRef.current);
            
            marker.bindPopup('Your Location').openPopup();
            setOriginMarker(marker);
          }
        },
        () => {
          console.log('Geolocation denied or unavailable');
        }
      );
    }

    // Click handler for setting destination
    map.on('click', (e) => {
      if (setOriginMode) {
        // Set origin
        if (originMarker) {
          originMarker.setLatLng(e.latlng);
        } else {
          const marker = L.marker(e.latlng, {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            }),
            draggable: true
          }).addTo(map);
          marker.bindPopup('Origin');
          setOriginMarker(marker);
        }
        setSetOriginMode(false);
      } else {
        // Set destination
        if (destMarker) {
          destMarker.setLatLng(e.latlng);
        } else {
          const marker = L.marker(e.latlng, {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).addTo(map);
          marker.bindPopup('Destination');
          setDestMarker(marker);
        }
        
        // Draw line
        if (originMarker) {
          updateRouteLine(originMarker.getLatLng(), e.latlng);
        }
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updateRouteLine = (origin: L.LatLng, dest: L.LatLng) => {
    if (routeLine) {
      routeLine.remove();
    }
    
    const line = L.polyline([origin, dest], {
      color: '#000',
      weight: 3,
      opacity: 0.7
    }).addTo(mapRef.current!);
    
    setRouteLine(line);
  };

  const handleCalculate = () => {
    if (!originMarker || !destMarker) {
      toast.error('Please set both origin and destination on the map');
      return;
    }

    const origin = originMarker.getLatLng();
    const dest = destMarker.getLatLng();
    const distKm = haversineDistance(origin.lat, origin.lng, dest.lat, dest.lng);

    const result = calculateMapFare(distKm, gasPrice, passengerType, hasBaggage);

    setMapStats({
      rateUsed: result.rateUsed,
      estimatedDist: result.estimatedRoadDist
    });

    onCalculate({
      fare: result.fare,
      routeName: 'Map Route',
      distance: result.estimatedRoadDist,
      passengerType,
      gasPrice,
      hasBaggage,
      regularFare: result.regularFare,
      studentFare: result.studentFare,
      rateUsed: result.rateUsed
    });
  };

  const handleReset = () => {
    if (destMarker) {
      destMarker.remove();
      setDestMarker(null);
    }
    if (routeLine) {
      routeLine.remove();
      setRouteLine(null);
    }
    setMapStats({ rateUsed: 0, estimatedDist: 0 });
  };

  return (
    <div>
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-96 rounded-xl overflow-hidden mb-4 border-2 border-gray-300 relative z-10" />

      {/* Map Info */}
      <div className="bg-gray-50 p-4 rounded-xl mb-4 text-sm space-y-1">
        <p className="text-blue-600 font-semibold">
          Rate Used: ₱{mapStats.rateUsed.toFixed(2)}/km
        </p>
        <p className="text-orange-600 font-semibold">
          Estimated road distance: {mapStats.estimatedDist.toFixed(2)} km
        </p>
        <p className="text-red-600 text-xs">
          Note: Fare is based on an estimated road distance (straight-line distance + 8%) to account for road curves.
        </p>
      </div>

      {/* Map Controls */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSetOriginMode(!setOriginMode)}
          className={`flex-1 py-3 px-4 rounded-full font-bold text-sm transition-all ${
            setOriginMode
              ? 'bg-yellow-500 text-black'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {setOriginMode ? 'Click map to set Origin' : 'Set Origin by Click'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation && mapRef.current) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                mapRef.current!.setView([latitude, longitude], 14);
                if (originMarker) {
                  originMarker.setLatLng([latitude, longitude]);
                }
              });
            }
          }}
          className="flex-1 py-3 px-4 bg-white text-black border-2 border-black rounded-full font-bold text-sm hover:bg-gray-50 transition-all"
        >
          Use My Location
        </button>
      </div>

      {/* Gas Price */}
      <GasPriceSelector gasPrice={gasPrice} onChange={onGasPriceChange} />

      {/* Passenger Type */}
        <div>
          <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <span className="text-lg">👤</span> Passenger
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPassengerTypeChange({ type: 'student' })}
              className={`p-4 rounded-2xl font-bold text-sm transition-all border-2 active:scale-95 ${ 
                passengerType.type === 'student'
                  ? 'bg-black text-white border-black shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🎓</div>
              <div className="text-xs">Student/PWD/Senior</div>
            </button>
            <button
              type="button"
              onClick={() => onPassengerTypeChange({ type: 'regular' })}
              className={`p-4 rounded-2xl font-bold text-sm transition-all border-2 active:scale-95 ${ 
                passengerType.type === 'regular'
                  ? 'bg-black text-white border-black shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">👔</div>
              <div className="text-xs">Regular</div>
            </button>
          </div>
        </div>
  
        {/* Baggage */}
        <label className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-gray-300 transition-all active:scale-[0.98] mt-4 pb-4">
          <input
            type="checkbox"
            checked={hasBaggage}
            onChange={(e) => onBaggageChange(e.target.checked)}
            className="w-6 h-6 accent-black cursor-pointer rounded-lg"
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900 flex items-center gap-2">
              <span>🎒</span> Baggage
            </div>
            <div className="text-xs text-gray-600 mt-0.5">Add ₱10.00 fee</div>
          </div>
        </label>

      {/* Action Buttons */}
      <button
        type="button"
        onClick={handleCalculate}
        className="w-full py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all mb-2 mt-4"
      >
        Calculate Fare
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="w-full py-4 bg-white text-black border-2 border-black rounded-full font-bold text-lg hover:bg-gray-50 transition-all"
      >
        Reset
      </button>
    </div>
  );
}