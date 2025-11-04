'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useDrag } from '@use-gesture/react';
import { FaSpinner } from 'react-icons/fa';
import L from 'leaflet';
import { FareCalculation, MapMarker, PassengerType } from '../lib/types'; // 💡 Use existing selectors
import { calculateMapFare, haversineDistance } from '../lib/fareCalculations';
import GasPriceSelector from './form/GasPriceSelector';
import PassengerSelector from './form/PassengerSelector';
import toast from 'react-hot-toast';

interface MapModeProps {
  gasPrice: number;
  passengerType: PassengerType;
  hasBaggage: boolean;
  onGasPriceChange: (price: number) => void;
  onPassengerTypeChange: (type: Partial<PassengerType>) => void;
  onBaggageChange: (value: boolean) => void;
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
  const [isMapInitializing, setIsMapInitializing] = useState(true);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const collapsedHeight = 230;
  const expandedHeight = window.innerHeight * 0.6;
  const fullyExpandedHeight = window.innerHeight - 80;

  // --- Constants for Marker Icons ---
  const originIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  const destIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  // --- Helper Functions ---
  const createMarker = (latlng: L.LatLng, options: L.MarkerOptions, popupText: string) => {
    if (!mapRef.current) return null;
    const marker = L.marker(latlng, options).addTo(mapRef.current);
    marker.bindPopup(popupText);
    return marker;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return;

    setIsMapInitializing(true);

    // Initialize map
    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([7.2320, 124.3650], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.whenReady(() => setIsMapInitializing(false));

    // --- 💡 FIX: Immediately create a fallback origin marker at the map's center ---
    const initialCenter = L.latLng(7.2320, 124.3650);
    const fallbackMarker = createMarker(initialCenter, { icon: originIcon, draggable: true }, 'Origin');
    setOriginMarker(fallbackMarker);

    mapRef.current = map;

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          
          // Ensure map still exists before adding marker
          if (mapRef.current && fallbackMarker) {
            const userLatLng = L.latLng(latitude, longitude);
            mapRef.current.setView(userLatLng, 13);
            fallbackMarker.setLatLng(userLatLng);
            fallbackMarker.setPopupContent('Your Location').openPopup();
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
          setOriginMarker(createMarker(e.latlng, { icon: originIcon, draggable: true }, 'Origin'));
        }
        setSetOriginMode(false);
      } else {
        // Set destination
        if (destMarker) {
          destMarker.setLatLng(e.latlng);
        } else {
          setDestMarker(createMarker(e.latlng, { icon: destIcon }, 'Destination'));
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

  // --- Draggable Panel Logic using @use-gesture/react ---
  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy], memo }) => {
      const panel = panelRef.current;
      if (!panel) return;

      if (!memo) {
        memo = panel.clientHeight; // Store initial height on drag start
      }

      let newHeight = memo - my;

      // Rubber band effect when dragging past boundaries
      if (newHeight < collapsedHeight) {
        const overflow = collapsedHeight - newHeight;
        newHeight = collapsedHeight - overflow * 0.4;
      } else if (newHeight > fullyExpandedHeight) {
        const overflow = newHeight - fullyExpandedHeight;
        newHeight = fullyExpandedHeight + overflow * 0.4;
      }

      if (down) {
        panel.style.transition = 'none';
        panel.style.height = `${newHeight}px`;
      } else {
        // On drag end, decide where to snap
        panel.style.transition = 'height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        const currentHeight = panel.clientHeight;
        let targetHeight: number;

        // Check for a "flick" gesture
        if (vy > 0.5) {
          targetHeight = dy > 0 ? fullyExpandedHeight : collapsedHeight;
        } else {
          // Snap to the nearest state (collapsed, expanded, or full)
          const distances = [
            { height: collapsedHeight, dist: Math.abs(currentHeight - collapsedHeight) },
            { height: expandedHeight, dist: Math.abs(currentHeight - expandedHeight) },
            { height: fullyExpandedHeight, dist: Math.abs(currentHeight - fullyExpandedHeight) },
          ];
          distances.sort((a, b) => a.dist - b.dist);
          targetHeight = distances[0].height;
        }
        panel.style.height = `${targetHeight}px`;
        setIsPanelExpanded(targetHeight > collapsedHeight);
      }
      return memo;
    },
    {
      axis: 'y',
      from: () => [0, -panelRef.current!.clientHeight],
      bounds: {
        top: -(fullyExpandedHeight + 100), // Allow over-dragging
        bottom: -(collapsedHeight - 100),
      },
    }
  );

  const togglePanel = () => {
    if (!panelRef.current) return;
    panelRef.current.style.transition = 'height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const newIsExpanded = !isPanelExpanded;
    if (newIsExpanded) {
      panelRef.current.style.height = `${expandedHeight}px`;
    } else {
      panelRef.current.style.height = `${collapsedHeight}px`;
    }
    setIsPanelExpanded(newIsExpanded);
  };

  // Effect to change map cursor based on setOriginMode
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = setOriginMode ? 'crosshair' : '';
    }
  }, [setOriginMode]);


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
    if (panelRef.current) {
      panelRef.current.style.height = `${collapsedHeight}px`;
    }
    setIsPanelExpanded(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Map Container with floating controls */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg border border-black">
        <div ref={mapContainerRef} className="w-full h-full z-10 bg-gray-200" />

        {isMapInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 z-20">
            <div className="flex items-center gap-2 text-gray-500">
              <FaSpinner className="animate-spin" />
              <span>Loading Map...</span>
            </div>
          </div>
        )}
        
        {/* Floating Action Buttons (FABs) for Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setSetOriginMode(!setOriginMode)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all text-2xl ${
              setOriginMode
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            title={setOriginMode ? 'Click map to set new Origin' : 'Set Custom Origin'}
          >
            📍
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation && mapRef.current) {
                toast.loading('Getting your location...');
                navigator.geolocation.getCurrentPosition((pos) => {
                  toast.dismiss();
                  toast.success('Location found!');
                  const { latitude, longitude } = pos.coords;
                  mapRef.current!.setView([latitude, longitude], 14);
                  if (originMarker) {
                    originMarker.setLatLng([latitude, longitude]);
                  }
                });
              }
            }}
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all text-2xl"
            title="Use My Location for Origin"
          >
            🛰️
          </button>
        </div>

        {/* Map Overlay for Expanded Panel */}
        {isPanelExpanded && (
          <div 
            className="absolute inset-0 bg-black/70 z-30 animate-fade-in"
            onClick={togglePanel}
          />
        )}

        {/* Bottom Panel with Smooth Drag */}
        <div
          ref={panelRef}
          className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)] border-t border-gray-200 z-40"
          style={{ height: `${collapsedHeight}px`, willChange: 'height' }}
        >
          <div className="p-6 flex flex-col h-full max-h-full" {...bind()}>
            {/* Grabber Handle - More prominent and easier to grab */}
            <div 
              className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-400 rounded-full cursor-grab active:cursor-grabbing" 
            />

            {/* Collapsed View */}
            <div className={`flex-shrink-0 ${isPanelExpanded ? 'hidden' : 'block'} animate-fade-in`} onClick={!isPanelExpanded ? togglePanel : undefined}>
              <div className="text-center font-semibold text-gray-700 mb-4 pt-2">
                SELECT DESTINATION
              </div>
              <div className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-left flex items-center justify-between gap-3 mb-4">
                <span className="text-gray-500">Destination...</span>
                <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">⋯</button>
              </div>
              <button
                onClick={handleCalculate}
                disabled={!originMarker || !destMarker}
                className="w-full py-4 bg-black text-white rounded-xl font-bold text-base transition-all shadow-md shadow-black/20 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                CALCULATE
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Swipe up to see more options.
              </p>
            </div>

            {/* Expanded View */}
            <div className={`flex flex-col flex-grow min-h-0 ${isPanelExpanded ? 'flex animate-fade-in' : 'hidden'} pt-2`}>
              <div className="text-center font-semibold text-gray-700 mb-4 flex-shrink-0">SELECT DESTINATION</div>
              <div className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-left flex items-center justify-between gap-3 mb-4 flex-shrink-0">
                <span className={destMarker ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                  {destMarker ? 'Destination Set' : 'Click on map...'}
                </span>
                <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">⋯</button>
              </div>

              {/* Scrollable Options Area */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-4 pl-1 -ml-1 custom-scrollbar">
                {/* Gas and Passenger Section */}
                <div className="grid grid-cols-2 gap-3">
                  <GasPriceSelector gasPrice={gasPrice} onChange={onGasPriceChange} />
                  <PassengerSelector
                    passengerType={passengerType}
                    onChange={onPassengerTypeChange}
                  />
                </div>

                {/* Baggage and Calculate Section */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onBaggageChange(!hasBaggage)}
                    className={`w-full p-4 text-sm font-semibold rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${hasBaggage ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    <span>🎒</span> Add Baggage
                  </button>
                  <button
                    onClick={handleCalculate}
                    disabled={!originMarker || !destMarker}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-base transition-all shadow-lg shadow-emerald-500/30 disabled:bg-gray-300 disabled:shadow-none disabled:from-gray-300 disabled:to-gray-300"
                  >
                    CONFIRM
                  </button>
                </div>

                {/* Other Options */}
                <div className="pt-2">
                  <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Other Options</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => toast('Coming soon!')} className="p-3 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 flex items-center justify-center gap-2">
                      <span className="text-lg">▶️</span> Record
                    </button>
                    <button 
                      onClick={() => setSetOriginMode(true)} 
                      className="p-3 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">📍</span> Custom Origin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}