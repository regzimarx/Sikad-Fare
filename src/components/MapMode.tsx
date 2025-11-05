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

// --- Configuration Constants ---
const MAP_CONFIG = {
  CENTER: [7.232, 124.365] as [number, number],
  ZOOM: 12,
  MAX_ZOOM: 19,
};

// Calculate dynamic panel heights based on viewport for better UX
const PANEL_HEIGHTS = {
  COLLAPSED: 240,
  EXPANDED: typeof window !== 'undefined' ? window.innerHeight * 0.55 : 400,
  FULL: typeof window !== 'undefined' ? window.innerHeight * 0.7 : 500,
};

// Custom icons for visual clarity on the map
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
  // --- Refs for DOM/Map Instances ---
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const destinationRef = useRef<L.Marker | null>(null);

  // --- State Management ---
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isOriginMode, setIsOriginMode] = useState(false); // Controls floating button state
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [markers, setMarkers] = useState<{ origin: L.Marker | null; destination: L.Marker | null }>({
    origin: null,
    destination: null,
  });
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');

  // -------------------------------------------------------------------
  // Function: createMarker
  // Purpose: Creates a Leaflet marker and handles the CRITICAL 'dragend' event for the origin.
  // Principle: Ensure user interactions (like dragging) update the source of truth (state/text).
  // -------------------------------------------------------------------
  const createMarker = useCallback(
    (latlng: L.LatLng, type: 'origin' | 'destination', draggable = false) => {
      if (!mapRef.current) return null;

      const marker = L.marker(latlng, { icon: MARKER_ICONS[type], draggable }).addTo(mapRef.current);

      if (type === 'destination') marker.bindPopup('🎯 Destination');

      // Add dragend listener ONLY for the draggable origin marker
      if (type === 'origin' && draggable) {
        marker.on('dragend', (e) => {
          const newLatLng = e.target.getLatLng();
          setFromText(`Lat: ${newLatLng.lat.toFixed(4)}, Lng: ${newLatLng.lng.toFixed(4)}`);
          toast.dismiss();
          toast.success('📍 Origin moved', { duration: 1500 });

          // Update markers state and redraw route line
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
    [] // Dependencies intentionally kept minimal, relying on state updates for re-render
  );

  // -------------------------------------------------------------------
  // Function: drawRouteLine
  // Purpose: Draws or redraws the polyline between origin and destination.
  // Principle: Centralize side effects (map manipulation) into specific functions.
  // -------------------------------------------------------------------
  const drawRouteLine = useCallback((origin: L.LatLng, dest: L.LatLng) => {
    if (!mapRef.current) return;

    // Remove previous line if it exists
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // Create new line
    const newLine = L.polyline([origin, dest], {
      color: '#000',
      weight: 3,
      opacity: 0.7,
    }).addTo(mapRef.current);

    routeLineRef.current = newLine;
  }, []);

  // -------------------------------------------------------------------
  // Function: getUserLocation
  // Purpose: Finds and sets the user's current location as the default origin.
  // Principle: Abstract complex browser APIs (Geolocation) into a reusable hook.
  // -------------------------------------------------------------------
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
            // If marker exists, just move it (dragend listener persists)
            prev.origin.setLatLng(latlng);
          } else {
            // If new, create it with drag enabled
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

  // -------------------------------------------------------------------
  // Effect: Initialize Map
  // Purpose: Sets up the Leaflet map instance and tile layer.
  // Principle: Use useEffect for mounting and cleanup of external libraries (Leaflet).
  // -------------------------------------------------------------------
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

    // Cleanup function
    return () => {
      if (routeLineRef.current) routeLineRef.current.remove();
      if (destinationRef.current) destinationRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [getUserLocation]);

  // -------------------------------------------------------------------
  // Effect: Handle Map Click (Origin and Destination Setting)
  // Purpose: Listens for map clicks and updates the correct marker based on isOriginMode.
  // Principle: Ensure state updates are atomic and side effects (map drawing) follow.
  // -------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      setMarkers((prev) => {
        const updated = { ...prev };

        if (isOriginMode) {
          // --- ORIGIN MODE LOGIC ---
          if (updated.origin) {
            // Move existing marker (dragend listener persists)
            updated.origin.setLatLng(e.latlng);
          } else {
            // Create new marker with dragend listener
            updated.origin = createMarker(e.latlng, 'origin', true);
          }
          
          // Update text field
          setFromText(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
          toast.dismiss();
          toast.success('📍 Origin updated');
          setIsOriginMode(false); // Exit origin mode after setting location

          // CRITICAL: Redraw route line if destination is set
          if (updated.origin && updated.destination) {
            drawRouteLine(updated.origin.getLatLng(), updated.destination.getLatLng());
          }
        } else {
          // --- DESTINATION MODE LOGIC (Default) ---
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

  // -------------------------------------------------------------------
  // Function: handleCalculate
  // Purpose: Calculates the final fare and passes the result to the parent component.
  // Principle: Decouple business logic (fare calculation) from presentation (UI).
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // Hook: useDrag for Panel
  // Purpose: Implements the draggable, snap-to-height behavior of the bottom panel.
  // Principle: Use specialized hooks (like use-gesture) for complex UI interactions.
  // -------------------------------------------------------------------
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

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-gray-200">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Map Loading State */}
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
              {/* Expanded Panel Details */}
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