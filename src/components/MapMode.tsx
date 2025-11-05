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
  CENTER: [7.2320, 124.3650] as [number, number],
  ZOOM: 12,
  MAX_ZOOM: 19,
};

const PANEL_HEIGHTS = {
  COLLAPSED: 240,
  EXPANDED: typeof window !== 'undefined' ? window.innerHeight * 0.55 : 400,
  FULL: typeof window !== 'undefined' ? window.innerHeight * 0.7 : 500, // shorter "full" height
};

const MARKER_ICONS = {
  origin: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  destination: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
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
}: MapModeProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const locationCircleRef = useRef<L.Circle | null>(null);

  const [markers, setMarkers] = useState<{ origin: L.Marker | null; destination: L.Marker | null }>({
    origin: null,
    destination: null,
  });
  const [routeLine, setRouteLine] = useState<L.Polyline | null>(null);
  const [isOriginMode, setIsOriginMode] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');

  const createMarker = useCallback(
    (latlng: L.LatLng, type: 'origin' | 'destination', draggable = false): L.Marker | null => {
      if (!mapRef.current) return null;
      const marker = L.marker(latlng, { icon: MARKER_ICONS[type], draggable }).addTo(mapRef.current);
      marker.bindPopup(type === 'origin' ? 'Origin' : 'Destination');
      return marker;
    },
    []
  );

  const updateRouteLine = useCallback(
    (origin: L.LatLng, dest: L.LatLng) => {
      if (!mapRef.current) return;
      if (routeLine) routeLine.remove();
      const line = L.polyline([origin, dest], { color: '#000', weight: 3, opacity: 0.7 }).addTo(mapRef.current);
      setRouteLine(line);
    },
    [routeLine]
  );

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    toast.loading('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        toast.success('Location found!');
        const { latitude, longitude, accuracy } = pos.coords;
        const latlng = L.latLng(latitude, longitude);

        mapRef.current?.setView(latlng, 14);

        setMarkers((prev) => {
          if (prev.origin) {
            prev.origin.setLatLng(latlng);
          } else {
            const newOrigin = createMarker(latlng, 'origin', true);
            return { ...prev, origin: newOrigin };
          }
          return prev;
        });

        setFromText(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);

        if (locationCircleRef.current) {
          mapRef.current?.removeLayer(locationCircleRef.current);
        }

        const circle = L.circle(latlng, {
          radius: accuracy || 30,
          color: '#3B82F6',
          fillColor: '#60A5FA',
          fillOpacity: 0.3,
        }).addTo(mapRef.current!);

        locationCircleRef.current = circle;
      },
      () => {
        toast.dismiss();
        toast.error('Could not get location');
      }
    );
  }, [createMarker]);

  // Map init
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(MAP_CONFIG.CENTER, MAP_CONFIG.ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    map.whenReady(() => setIsMapLoading(false));

    const initialOrigin = createMarker(L.latLng(MAP_CONFIG.CENTER[0], MAP_CONFIG.CENTER[1]), 'origin', true);
    setMarkers({ origin: initialOrigin, destination: null });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [createMarker]);

  useEffect(() => {
    if (!mapRef.current) return;
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isOriginMode) {
        setMarkers((prev) => {
          if (prev.origin) prev.origin.setLatLng(e.latlng);
          else {
            const newOrigin = createMarker(e.latlng, 'origin', true);
            return { ...prev, origin: newOrigin };
          }
          return prev;
        });
        setFromText(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
        setIsOriginMode(false);
      } else {
        setMarkers((prev) => {
          if (prev.destination) prev.destination.setLatLng(e.latlng);
          else {
            const newDest = createMarker(e.latlng, 'destination');
            return { ...prev, destination: newDest };
          }
          if (prev.origin) updateRouteLine(prev.origin.getLatLng(), e.latlng);
          return prev;
        });
        setToText(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
      }
    };
    mapRef.current.on('click', handleMapClick);
    return () => { mapRef.current?.off('click', handleMapClick); };
  }, [isOriginMode, createMarker, updateRouteLine]);

  useEffect(() => {
    if (mapContainerRef.current)
      mapContainerRef.current.style.cursor = isOriginMode ? 'crosshair' : '';
  }, [isOriginMode]);

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
  }, [markers, gasPrice, passengerType, hasBaggage, onCalculate]);

  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy], memo }) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (!memo) memo = panel.clientHeight;
      let newHeight = memo - my;

      if (newHeight < PANEL_HEIGHTS.COLLAPSED) {
        const overflow = PANEL_HEIGHTS.COLLAPSED - newHeight;
        newHeight = PANEL_HEIGHTS.COLLAPSED - overflow * 0.3;
      } else if (newHeight > PANEL_HEIGHTS.FULL) {
        const overflow = newHeight - PANEL_HEIGHTS.FULL;
        newHeight = PANEL_HEIGHTS.FULL + overflow * 0.3;
      }

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
          <div className="flex items-center gap-2 text-gray-700">
            <FaSpinner className="animate-spin" />
            <span>Loading Map...</span>
          </div>
        </div>
      )}

      {/* Floating Buttons */}
      <div className="absolute bottom-[310px] right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setIsOriginMode(!isOriginMode)}
          className={`w-12 h-12 rounded-full shadow-xl transition-all text-2xl ${
            isOriginMode ? 'bg-yellow-400 text-black' : 'bg-white hover:bg-gray-100'
          }`}
          title="Set Custom Origin"
        >
          📍
        </button>
        <button
          type="button"
          onClick={getUserLocation}
          className="w-12 h-12 bg-white text-black rounded-full shadow-xl hover:bg-gray-100 transition-all text-2xl"
          title="Use My Location"
        >
          🛰️
        </button>
      </div>

      {/* Bottom Panel */}
      <div
        ref={panelRef}
        className="fixed bottom-[60px] left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40"
        style={{ height: `${PANEL_HEIGHTS.COLLAPSED}px` }}
      >
        <div className="p-6 flex flex-col h-full relative">
          <div {...bind()} className="absolute top-0 left-0 right-0 h-8 cursor-grab" />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full pointer-events-none" />

          {!isPanelExpanded ? (
            <div className="pt-4 text-center">
              <div className="text-lg font-bold text-gray-800">SET YOUR DESTINATION</div>
              <p className="text-sm text-gray-500 mb-4">Click on the map to set destination</p>

              <input
                type="text"
                disabled
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 mb-4 text-center"
                value={markers.destination ? 'Destination set' : 'Tap on the map'}
              />

              <button
                onClick={handleCalculate}
                disabled={!markers.origin || !markers.destination}
                className="w-full py-4 bg-black text-white rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calculate Fare
              </button>
            </div>
          ) : (
            <div className="flex flex-col flex-grow pt-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* From Field */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                      <span>📍</span> From
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800"
                      value={fromText || 'Select origin point'}
                    />
                  </div>
                  <GasPriceSelector gasPrice={gasPrice} onChange={onGasPriceChange} />
                  <PassengerSelector passengerType={passengerType} onChange={onPassengerTypeChange} />
                </div>

                {/* Right Column */}
                <div className="flex flex-col space-y-4">
                  {/* To Field */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                      <span>🎯</span> To
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800"
                      value={toText || 'Select destination point'}
                    />
                  </div>
                  <BaggageSelector hasBaggage={hasBaggage} onChange={onBaggageChange} />
                  <div className="mt-auto pt-2">
                    <button
                      onClick={handleCalculate}
                      disabled={!markers.origin || !markers.destination}
                      className="w-full py-5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all shadow-md shadow-black/20 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Calculate Fare
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
