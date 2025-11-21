'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { FaSpinner } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { PassengerType, FareCalculation, HistoryEntry } from '../../lib/types';
import { CalculationMode } from '../../lib/types'; // Import CalculationMode
import { calculateMapFare, haversineDistance } from '../../lib/fareCalculations';
import GasPriceSelector from '../form/GasPriceSelector';
import PassengerSelector from '../form/PassengerSelector';
import BaggageSelector from '../form/BaggageSelector';
import ModeToggle from '../ModeToggle';
import Modal from '../Modal';
import FareResult from '../FareResult';

// Firebase Service Imports
import { logFareCalculation } from '../../services/analytics';

// Configuration Constants
const MAP_CONFIG = {
  CENTER: [7.1915, 124.5385] as [number, number],
  ZOOM: 14,
  MAX_ZOOM: 19,
};

const PANEL_HEIGHTS = {
  COLLAPSED: 240,
  EXPANDED: typeof window !== 'undefined' ? window.innerHeight * 0.55 : 400,
  FULL: typeof window !== 'undefined' ? window.innerHeight * 0.7 : 500,
};

const MARKER_ICONS = {
  origin: L.icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  destination: L.icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
};

// Helper Functions
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

interface MapModeProps {
  gasPrice: number;
  passengerType: PassengerType;
  hasBaggage: boolean;
  onGasPriceChange: (price: number) => void;
  onPassengerTypeChange: (type: Partial<PassengerType>) => void;
  onBaggageChange: (value: boolean) => void;
  history: HistoryEntry[];
  clearHistory: () => void;
  onCalculate: (result: any) => void;
  onError: (error: string) => void;
  onHistoryVisibilityChange: (isVisible: boolean) => void; // Callback to parent for history visibility
  mode: CalculationMode; // Current calculation mode
  onModeChange: (mode: CalculationMode) => void; // Handler to change mode
  isHistoryOpen: boolean; // Prop from parent indicating if *any* history is open
}

export default function MapMode({
  gasPrice,
  passengerType,
  hasBaggage,
  onGasPriceChange,
  onPassengerTypeChange,
  onBaggageChange,
  onCalculate,
  history,
  clearHistory,
  onError,
  onHistoryVisibilityChange, // Callback to parent for history visibility
  mode, // Current calculation mode
  onModeChange, // Handler to change mode
  isHistoryOpen, // Prop from parent indicating if *any* history is open
}: MapModeProps) {
  // Refs
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const destinationRef = useRef<L.Marker | null>(null);

  // State
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isOriginMode, setIsOriginMode] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [markers, setMarkers] = useState<{ origin: L.Marker | null; destination: L.Marker | null }>({
    origin: null,
    destination: null,
  });
  const [fromText, setFromText] = useState('Getting location...');
  const [toText, setToText] = useState('Tap on map');
  const [isGeocodingOrigin, setIsGeocodingOrigin] = useState(false);
  const [isGeocodingDest, setIsGeocodingDest] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [fareResult, setFareResult] = useState<FareCalculation | null>(null);

  // Effect to notify the parent component when history visibility changes
  useEffect(() => {
    onHistoryVisibilityChange(isHistoryVisible);
  }, [isHistoryVisible, onHistoryVisibilityChange]);

  // Reverse Geocoding
  const reverseGeocode = useCallback(async (latlng: L.LatLng, type: 'origin' | 'destination') => {
    const setLoading = type === 'origin' ? setIsGeocodingOrigin : setIsGeocodingDest;
    const setText = type === 'origin' ? setFromText : setToText;
    const fallbackText = `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`;

    setLoading(true);
    setText('Fetching address...');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        let displayName = data.display_name;
        if (displayName.length > 50) {
          const addr = data.address;
          const shortAddress = [
            addr.road || addr.suburb,
            addr.city || addr.town || addr.village,
            addr.country,
          ]
            .filter(Boolean)
            .join(', ');
          displayName = shortAddress || displayName.split(',').slice(0, 3).join(',');
        }
        setText(displayName);
      } else {
        setText(fallbackText);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setText(fallbackText);
      toast.error('Could not fetch address.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create Marker
  const createMarker = useCallback(
    (latlng: L.LatLng, type: 'origin' | 'destination', draggable = false) => {
      const map = mapRef.current;
      if (!map) return null;

      const marker = L.marker(latlng, { icon: MARKER_ICONS[type], draggable }).addTo(map);

      if (type === 'destination') marker.bindPopup('🎯 Destination');

      if (type === 'origin' && draggable) {
        marker.on('dragend', (e) => {
          const newLatLng = e.target.getLatLng();
          reverseGeocode(newLatLng, 'origin');
          toast.dismiss();
          toast.success('📍 Origin moved', { duration: 1500 });

          setMarkers((prev) => {
            const updated = { ...prev, origin: e.target };
            if (updated.destination) {
              drawRouteLine(updated.origin!.getLatLng(), updated.destination.getLatLng());
            }
            return updated;
          });
        });
      }

      return marker;
    },
    [reverseGeocode]
  );

  // Draw Route Line
  const drawRouteLine = useCallback((origin: L.LatLng, dest: L.LatLng) => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    const newLine = L.polyline([origin, dest], {
      color: '#000',
      weight: 3,
      opacity: 0.7,
    }).addTo(mapRef.current);

    routeLineRef.current = newLine;
  }, []);

  // Get User Location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = L.latLng(latitude, longitude);
        const map = mapRef.current;
        if (map) map.setView(latlng, 15);

        toast.dismiss();
        toast.success('📍 Location found', { duration: 2000 });

        setMarkers((prev) => {
          if (prev.origin) {
            prev.origin.setLatLng(latlng);
          } else {
            const newOriginMarker = createMarker(latlng, 'origin', true);
            return { ...prev, origin: newOriginMarker };
          }
          return { ...prev };
        });

        reverseGeocode(latlng, 'origin');
      },
      () => {
        toast.error('Unable to retrieve location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [createMarker, reverseGeocode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(
      MAP_CONFIG.CENTER,
      MAP_CONFIG.ZOOM
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    map.whenReady(() => {
      setIsMapLoading(false);
      getUserLocation();
    });

    mapRef.current = map;

    return () => {
      if (routeLineRef.current) routeLineRef.current.remove();
      if (destinationRef.current) destinationRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [getUserLocation]);

  // Handle Map Click
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      if (isOriginMode) {
        setMarkers((prev) => {
          const updated = { ...prev };
          if (updated.origin) {
            map.removeLayer(updated.origin);
            updated.origin = createMarker(e.latlng, 'origin', true);
          } else {
            updated.origin = createMarker(e.latlng, 'origin', true);
          }
          if (updated.origin && updated.destination) {
            drawRouteLine(updated.origin.getLatLng(), updated.destination.getLatLng());
          }
          return updated;
        });

        reverseGeocode(e.latlng, 'origin');
        toast.dismiss();
        toast.success('📍 Origin updated');
        setIsOriginMode(false);
      } else {
        setMarkers((prev) => {
          const updated = { ...prev };
          if (destinationRef.current) {
            map.removeLayer(destinationRef.current);
          }
          const newDest = createMarker(e.latlng, 'destination');
          destinationRef.current = newDest;
          updated.destination = newDest;

          if (updated.origin && updated.destination) {
            drawRouteLine(updated.origin.getLatLng(), updated.destination.getLatLng());
          }
          return updated;
        });
        reverseGeocode(e.latlng, 'destination');
        toast.dismiss();
        toast.success('🎯 Destination set');
      }
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [isOriginMode, createMarker, drawRouteLine, reverseGeocode]);

  // Calculate Fare
  const handleCalculate = useCallback(() => {
    if (!markers.origin || !markers.destination) {
      toast.error('Please set both origin and destination');
      return;
    }

    const origin = markers.origin.getLatLng();
    const dest = markers.destination.getLatLng();
    const distKm = haversineDistance(origin.lat, origin.lng, dest.lat, dest.lng);
    const result = calculateMapFare(distKm, gasPrice, passengerType, hasBaggage);

    const finalResult: FareCalculation = {
      fare: result.fare,
      routeName: 'Map Route',
      distance: result.estimatedRoadDist,
      passengerType,
      gasPrice,
      hasBaggage,
      regularFare: result.regularFare,
      studentFare: result.studentFare,
      rateUsed: result.rateUsed,
    };

    onCalculate(finalResult);
    setFareResult(finalResult);
    setIsModalOpen(true);
    toast.dismiss();

    const originText = fromText.includes('Lat:') ? 'GPS Coordinates' : fromText;
    const destText = toText.includes('Lat:') ? 'GPS Coordinates' : toText;
    logFareCalculation(originText, destText, 'map');
  }, [markers, gasPrice, passengerType, hasBaggage, onCalculate, fromText, toText]);

  // Panel Drag Gesture
  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy], memo }) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (!memo) memo = panel.clientHeight;

      let newHeight = memo - my;
      newHeight = Math.max(PANEL_HEIGHTS.COLLAPSED, Math.min(newHeight, PANEL_HEIGHTS.FULL));

      if (down) {
        panel.style.transition = 'none';
        panel.style.height = `${newHeight}px`;
      } else {
        panel.style.transition = 'height 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        let target = PANEL_HEIGHTS.EXPANDED;
        if (vy > 0.4) target = dy > 0 ? PANEL_HEIGHTS.COLLAPSED : PANEL_HEIGHTS.FULL;
        else if (newHeight < (PANEL_HEIGHTS.COLLAPSED + PANEL_HEIGHTS.EXPANDED) / 2)
          target = PANEL_HEIGHTS.COLLAPSED;
        else if (newHeight > (PANEL_HEIGHTS.EXPANDED + PANEL_HEIGHTS.FULL) / 2)
          target = PANEL_HEIGHTS.FULL;
        panel.style.height = `${target}px`;
        setIsPanelExpanded(target > PANEL_HEIGHTS.COLLAPSED);
      }
      return memo;
    },
    { axis: 'y' }
  );

  return (
    <div className="fixed inset-0 bg-gray-200">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Mode Toggle - positioned within MapMode */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20"> {/* z-20 to be above map, below history backdrop */}
        <ModeToggle mode={mode} onModeChange={onModeChange} isHistoryOpen={isHistoryOpen || isHistoryVisible} />
      </div>

      {/* Map Loading State */}
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 z-10">
          <FaSpinner className="animate-spin text-gray-700 text-xl" />
          <span className="ml-2 text-gray-700">Loading Map...</span>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-[250px] right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            setIsOriginMode(!isOriginMode);
            toast.dismiss();
            if (!isOriginMode) {
              toast('Tap on the map to set a new Origin', { icon: '👆' });
            }
          }}
          className={`w-12 h-12 rounded-full shadow-lg text-2xl transition ${
            isOriginMode ? 'bg-yellow-400 text-black' : 'bg-white hover:bg-gray-100'
          }`}
          title="Set Custom Origin"
        >
          📍
        </button>
        
        {/* History Button */}
        <button
          type="button"
          onClick={() => setIsHistoryVisible(true)}
          className="w-12 h-12 rounded-full shadow-lg bg-white hover:bg-gray-100 flex items-center justify-center"
          title="View History"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
        </button>
      </div>

      {/* Bottom Panel */}
      <div
        ref={panelRef}
        className="fixed bottom-[5px] left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 transition-all"
        style={{ height: `${PANEL_HEIGHTS.COLLAPSED}px` }}
      >
        <div className="p-6 flex flex-col h-full relative">
          <div
            {...bind()}
            className="absolute top-0 left-0 right-0 h-8 cursor-grab"
            style={{ touchAction: 'none' }}
          />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full pointer-events-none" />

          {!isPanelExpanded ? (
            <div className="pt-2 text-center">
              <div className="text-lg font-bold text-gray-800">SET YOUR DESTINATION</div>
              <p className="text-sm text-gray-500 mb-4">Click on the map to set destination</p>

              <button
                onClick={handleCalculate}
                disabled={!markers.origin || !markers.destination}
                className="w-full py-4 bg-black text-white rounded-xl font-bold mt-1 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calculate Fare
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 pt-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-1">
                    📍 From
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                    value={fromText}
                  />
                </div>
                <GasPriceSelector gasPrice={gasPrice} onChange={onGasPriceChange} />
                <PassengerSelector passengerType={passengerType} onChange={onPassengerTypeChange} />
              </div>

              <div className="flex flex-col space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-1">
                    🎯 To
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                    value={toText}
                  />
                </div>
                <BaggageSelector hasBaggage={hasBaggage} onChange={onBaggageChange} />
                <button
                  onClick={handleCalculate}
                  disabled={!markers.origin || !markers.destination}
                  className="mt-auto py-5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition disabled:bg-gray-300"
                >
                  Calculate Fare
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fare Result Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {fareResult && <FareResult result={fareResult} />}
      </Modal>

      {/* History Backdrop */}
      {isHistoryVisible && (
        <div
          onClick={() => setIsHistoryVisible(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* History Sheet */}
      <div
        className={`fixed bottom-[70px] left-0 right-0 bg-gray-50 rounded-t-3xl p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isHistoryVisible ? 'translate-y-0' : 'translate-y-full'
        } ${history.length === 0 ? 'h-auto' : ''}`}
        style={{ height: history.length > 0 ? 'calc(100vh - 140px)' : undefined }}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Map Calculation History</h2>
          {history.length > 0 && (
            <button
              onClick={() => {
                clearHistory();
                setIsHistoryVisible(false);
              }}
              className="py-1 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="max-h-[calc(100vh_-_200px)] overflow-y-auto pt-4">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No map history yet.</p>
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
                      <p className="text-lg font-bold text-gray-900 text-right">
                        ₱{item.fare.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center text-xs text-gray-500">
                    <span title="Passenger Type & Quantity" className="flex items-center">
                      👤 {item.passengerType.quantity}{' '}
                      {formatPassengerType(item.passengerType.type, item.passengerType.quantity)}
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
    </div>
  );
}