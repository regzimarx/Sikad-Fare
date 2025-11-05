'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { FaSpinner } from 'react-icons/fa';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { PassengerType } from '../lib/types';
import { calculateMapFare, haversineDistance } from '../lib/fareCalculations';
import GasPriceSelector from './form/GasPriceSelector';
import PassengerSelector from './form/PassengerSelector';
import BaggageSelector from './form/BaggageSelector';

const MAP_CONFIG = {
  CENTER: [7.232, 124.365] as [number, number],
  ZOOM: 12,
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

interface MapModeProps {
  gasPrice: number;
  passengerType: PassengerType;
  hasBaggage: boolean;
  onGasPriceChange: (price: number) => void;
  onPassengerTypeChange: (type: Partial<PassengerType>) => void;
  onBaggageChange: (value: boolean) => void;
  onCalculate: (result: any) => void;
}

export default function MapMode({
  gasPrice,
  passengerType,
  hasBaggage,
  onGasPriceChange,
  onPassengerTypeChange,
  onBaggageChange,
  onCalculate,
}: MapModeProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const routeLineRef = useRef<L.Polyline | null>(null);
  const destinationRef = useRef<L.Marker | null>(null);

  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isOriginMode, setIsOriginMode] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [markers, setMarkers] = useState<{ origin: L.Marker | null; destination: L.Marker | null }>({
    origin: null,
    destination: null,
  });
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');

  const createMarker = useCallback(
    (latlng: L.LatLng, type: 'origin' | 'destination', draggable = false) => {
      if (!mapRef.current) return null;
      const marker = L.marker(latlng, { icon: MARKER_ICONS[type], draggable }).addTo(mapRef.current);
      if (type === 'destination') marker.bindPopup('🎯 Destination');
      return marker;
    },
    []
  );

  const drawRouteLine = useCallback((origin: L.LatLng, dest: L.LatLng) => {
    if (!mapRef.current) return;

    // remove previous line if it exists
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // create new line
    const newLine = L.polyline([origin, dest], {
      color: '#000',
      weight: 3,
      opacity: 0.7,
    }).addTo(mapRef.current);

    routeLineRef.current = newLine;
  }, []);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = L.latLng(latitude, longitude);
        if (mapRef.current) mapRef.current.setView(latlng, 15);

        toast.dismiss();
        toast.success('📍 Location found', { duration: 2000 });

        setMarkers((prev) => {
          if (prev.origin) {
            prev.origin.setLatLng(latlng);
          } else {
            const newOrigin = createMarker(latlng, 'origin', true);
            return { ...prev, origin: newOrigin };
          }
          return { ...prev };
        });

        setFromText(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      },
      () => {
        toast.error('Unable to retrieve location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [createMarker]);

  // Initialize map
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
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      if (destinationRef.current) {
        destinationRef.current.remove();
        destinationRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [getUserLocation]);

  // Handle map click (ensures only one destination and line)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      setMarkers((prev) => {
        const updated = { ...prev };

        if (isOriginMode) {
          if (updated.origin) updated.origin.setLatLng(e.latlng);
          else updated.origin = createMarker(e.latlng, 'origin', true);
          setFromText(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
          toast.dismiss();
          toast.success('📍 Origin updated');
          setIsOriginMode(false);
        } else {
          // Remove old destination marker immediately
          if (destinationRef.current) {
            map.removeLayer(destinationRef.current);
            destinationRef.current = null;
          }

          // Create new destination marker
          const newDest = createMarker(e.latlng, 'destination');
          destinationRef.current = newDest;
          updated.destination = newDest;

          setToText(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
          toast.dismiss();
          toast.success('🎯 Destination set');

          // Draw route line (removing old one)
          if (updated.origin && updated.destination) {
            drawRouteLine(updated.origin.getLatLng(), updated.destination.getLatLng());
          }
        }

        return updated;
      });
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [isOriginMode, createMarker, drawRouteLine]);

  const handleCalculate = useCallback(() => {
    if (!markers.origin || !markers.destination) {
      toast.error('Please set both origin and destination');
      return;
    }

    const origin = markers.origin.getLatLng();
    const dest = markers.destination.getLatLng();
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
      rateUsed: result.rateUsed,
    });

    toast.dismiss();
    toast.success('✅ Fare calculated!');
  }, [markers, gasPrice, passengerType, hasBaggage, onCalculate]);

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
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 z-10">
          <FaSpinner className="animate-spin text-gray-700 text-xl" />
          <span className="ml-2 text-gray-700">Loading Map...</span>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="absolute bottom-[250px] right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setIsOriginMode(!isOriginMode)}
          className={`w-12 h-12 rounded-full shadow-lg text-2xl transition ${
            isOriginMode ? 'bg-yellow-400 text-black' : 'bg-white hover:bg-gray-100'
          }`}
          title="Set Custom Origin"
        >
          📍
        </button>
      </div>

      {/* Bottom Panel */}
      <div
        ref={panelRef}
        className="fixed bottom-[5px] left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 transition-all"
        style={{ height: `${PANEL_HEIGHTS.COLLAPSED}px` }}
      >
        <div className="p-6 flex flex-col h-full relative">
          <div {...bind()} className="absolute top-0 left-0 right-0 h-8 cursor-grab" />
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
                    value={fromText || 'Getting location...'}
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
                    value={toText || 'Tap on map'}
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
    </div>
  );
}
