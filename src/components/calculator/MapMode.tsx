'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { FaSpinner } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { PassengerType, FareCalculation, HistoryEntry } from '../../lib/types';
import { CalculationMode } from '../../lib/types'; 
import GasPriceSelector from '../form/GasPriceSelector';
import PassengerSelector from '../form/PassengerSelector';
import BaggageSelector from '../form/BaggageSelector';
import Modal from '../Modal';
import FareResult from '../FareResult';
import HistorySheet from '../HistorySheet';
import { logHistoryOpened, logHistoryCleared } from '../../services/analytics';
// Firebase Service Imports

// API Keys
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
const ORS_KEY = process.env.NEXT_PUBLIC_ORS_KEY || process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;

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
  const originRef = useRef<L.Marker | null>(null);
  const destinationRef = useRef<L.Marker | null>(null);

  // State
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isOriginMode, setIsOriginMode] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [markers, setMarkers] = useState<{ origin: L.Marker | null; destination: L.Marker | null }>({
    origin: null,
    destination: null,
  });
  const [routeCache, setRouteCache] = useState<{ distanceMeters: number; coords: number[][] } | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
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

  // Informative runtime check: warn if tile/routing keys are missing
  useEffect(() => {
    if (!MAPTILER_KEY) {
      console.info('MapMode: MapTiler key not set (checked NEXT_PUBLIC_MAPTILER_KEY and NEXT_PUBLIC_MAPTILER_API_KEY) — using OpenStreetMap tiles');
      toast('Using OpenStreetMap tiles (no MapTiler key set)', { icon: '🗺️' });
    }
    if (!ORS_KEY) {
      console.info('MapMode: ORS key not set (checked NEXT_PUBLIC_ORS_KEY and NEXT_PUBLIC_OPENROUTESERVICE_API_KEY) — routing will be unavailable');
      toast('Routing is disabled. Set an ORS API key to enable it.', { icon: '⚠️' });
    }

    // Dev-only: show masked presence of keys so developer can confirm client build picked them up
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const mask = (s?: string) => {
        if (!s) return '---';
        if (s.length <= 8) return s.replace(/.(?=.{2})/g, '*');
        return `${s.slice(0, 4)}...${s.slice(-4)}`;
      };
      const mtStatus = MAPTILER_KEY ? `loaded (${mask(MAPTILER_KEY)})` : 'MISSING';
      const orsStatus = ORS_KEY ? `loaded (${mask(ORS_KEY)})` : 'MISSING';
      console.info(`MapMode (dev): MAPTILER=${mtStatus}, ORS=${orsStatus}`);
      toast(`Dev keys — MAPTILER: ${mtStatus} · ORS: ${orsStatus}`, { duration: 4000 });
    }
  }, []);

  // Reverse Geocoding
  const reverseGeocode = useCallback(async (latlng: L.LatLng, type: 'origin' | 'destination') => {
    const setLoading = type === 'origin' ? setIsGeocodingOrigin : setIsGeocodingDest;
    const setText = type === 'origin' ? setFromText : setToText;
    const fallbackText = `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`;

    setLoading(true);
    setText('Fetching address...');

    // Prefer OpenRouteService reverse geocoding (CORS-friendly) if API key present
    try {
      if (ORS_KEY) {
        // ORS reverse geocode
        const url = `https://api.openrouteservice.org/geocode/reverse?point.lat=${latlng.lat}&point.lon=${latlng.lng}`;
        const res = await fetch(url, {
          headers: { Authorization: ORS_KEY },
        });
        if (res.ok) {
          const data = await res.json();
          const feat = data.features && data.features[0];
          const label = feat?.properties?.label || feat?.properties?.name || feat?.properties?.housenumber || null;
          if (label) {
            setText(label.length > 60 ? label.split(',').slice(0, 3).join(',') : label);
            setLoading(false);
            return;
          }
        } else {
          console.warn('ORS reverse geocode failed', res.status);
        }
      }

      if (MAPTILER_KEY) {
        // MapTiler reverse geocode
        const url = `https://api.maptiler.com/geocoding/${latlng.lng},${latlng.lat}.json?key=${MAPTILER_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const feat = data.features && data.features[0];
          const display = feat?.properties?.label || feat?.place_name || feat?.properties?.formatted || null;
          if (display) {
            setText(display.length > 60 ? display.split(',').slice(0, 3).join(',') : display);
            setLoading(false);
            return;
          }
        } else {
          console.warn('MapTiler reverse geocode failed', res.status);
        }
      }

      // As a last resort, avoid calling Nominatim (CORS) — just show coords
      setText(fallbackText);
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

      // Track marker in refs to guarantee single instance
      if (type === 'origin') originRef.current = marker;
      if (type === 'destination') destinationRef.current = marker;
      
      if (type === 'origin' && draggable) {
        marker.on('dragend', (e) => {
          const newLatLng = e.target.getLatLng();
          reverseGeocode(newLatLng, 'origin');
          toast.dismiss();
          toast.success('📍 Origin moved', { duration: 1500 });

          setMarkers((prev) => {
            // update origin ref to the dragged marker
            originRef.current = e.target;
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

  // Fetch route from OpenRouteService (returns distance meters and coords [lon,lat])
  // getRouteFromORS: request ORS directions and return distance/duration/coords
  const getRouteFromORS = useCallback(async (o: L.LatLng, d: L.LatLng) => {
    if (!ORS_KEY) {
      console.error('MapMode: ORS key not set (checked NEXT_PUBLIC_ORS_KEY and NEXT_PUBLIC_OPENROUTESERVICE_API_KEY) — cannot perform routing');
      toast.error('Routing unavailable: ORS API key is not configured.');
      return null;
    }
    try {
      const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
      const body = {
        coordinates: [
          [o.lng, o.lat],
          [d.lng, d.lat],
        ],
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: ORS_KEY,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`ORS error ${res.status}`);
      const data = await res.json();
      const feat = data.features && data.features[0];
      if (!feat) return null;
      const distanceMeters = feat.properties?.summary?.distance ?? null;
      const duration = feat.properties?.summary?.duration ?? null;
      const coords: number[][] = feat.geometry?.coordinates ?? [];
      return { distanceMeters, duration, coords };
    } catch (err) {
      console.warn('Routing failed', err);
      return null;
    }
  }, []);

  // Fare calculation per requirements:
  // Base fare: ₱15 for 0–2 km
  // After 2 km: ₱2 per additional km
  // distanceInKm: use ORS distance (decimal km)
  const calculateFare = (distanceInKm: number) => {
    const base = 15;
    const extraPerKm = 2; // per km after 2km
    const roundedDistance = Math.round(distanceInKm * 100) / 100; // round to 2 decimals for display
    const extraKm = Math.max(0, roundedDistance - 2);
    const extraCost = Math.round(extraKm * extraPerKm * 100) / 100;
    const fare = Math.round((base + extraCost) * 100) / 100;
    return { fare, roundedDistance };
  };

  // Draw Route Line
  const drawRouteLine = useCallback((origin: L.LatLng, dest: L.LatLng) => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    const newLine = L.polyline([origin, dest], {
      color: '#000',
      weight: 3,
      opacity: 0.7,
    }).addTo(mapRef.current!);

    routeLineRef.current = newLine;
  }, []);

  // Draw a full route polyline from an array of latlngs
  const drawRoutePolyline = useCallback((latlngs: L.LatLngExpression[]) => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    const newLine = L.polyline(latlngs, {
      color: '#0b5fff',
      weight: 4,
      opacity: 0.9,
    }).addTo(mapRef.current);

    routeLineRef.current = newLine;
  }, []);

  // Reset Map State
  const resetMapState = useCallback(() => {
    if (originRef.current) {
      originRef.current.remove();
      originRef.current = null;
    }
    if (destinationRef.current) {
      destinationRef.current.remove();
      destinationRef.current = null;
    }
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    setMarkers({ origin: null, destination: null });
    setRouteCache(null);
    setFareResult(null);
    setIsModalOpen(false);
  }, []);

  // Get User Location (Permissions-aware, logs coords for debugging)
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    // Use Permissions API if available to detect denied state early
    try {
      if (navigator.permissions && navigator.permissions.query) {
        // @ts-ignore
        navigator.permissions.query({ name: 'geolocation' }).then((status: any) => {
          if (status.state === 'denied') {
            toast.error('Location permission denied. Please enable location for this site.');
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.debug('Geolocation success coords:', pos.coords);
              const { latitude, longitude } = pos.coords;
              const latlng = L.latLng(latitude, longitude);
              const map = mapRef.current;
              if (map) map.setView(latlng, 15);

              toast.dismiss();
              toast.success('📍 Location found', { duration: 2000 });

              resetMapState();
              setMarkers(() => {
                const newOriginMarker = createMarker(latlng, 'origin', true);
                return { origin: newOriginMarker, destination: null };
              });

              reverseGeocode(latlng, 'origin');
            },
            (err) => {
              console.warn('Geolocation error', err);
              toast.error('Unable to retrieve location');
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      } else {
        // Fallback when Permissions API not available
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.debug('Geolocation success coords (no permissions API):', pos.coords);
            const { latitude, longitude } = pos.coords;
            const latlng = L.latLng(latitude, longitude);
            const map = mapRef.current;
            if (map) map.setView(latlng, 15);

            toast.dismiss();
            toast.success('📍 Location found', { duration: 2000 });

            resetMapState();
            setMarkers(() => {
              const newOriginMarker = createMarker(latlng, 'origin', true);
              return { origin: newOriginMarker, destination: null };
            });

            reverseGeocode(latlng, 'origin');
          },
          () => {
            toast.error('Unable to retrieve location');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } catch (ex) {
      console.error('getUserLocation check failed', ex);
      toast.error('Unable to request location');
    }
  }, [createMarker, reverseGeocode, resetMapState]);

  // When the MapMode component mounts (e.g., user clicked Map Mode), attempt to get user location
  useEffect(() => {
    // Try immediate; if map not ready yet, wait until mapRef exists
    if (mapRef.current) {
      getUserLocation();
      return;
    }

    let mounted = true;
    const id = setInterval(() => {
      if (!mounted) return;
      if (mapRef.current) {
        getUserLocation();
        clearInterval(id);
      }
    }, 400);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [getUserLocation]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(
      MAP_CONFIG.CENTER,
      MAP_CONFIG.ZOOM
    );

    // Use MapTiler tiles (streets-v2) when API key is provided, otherwise fallback to OpenStreetMap
    const streetsUrl = MAPTILER_KEY
      ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const satelliteUrl = MAPTILER_KEY
      ? `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const initialUrl = isSatellite ? satelliteUrl : streetsUrl;
    const initialAttribution = MAPTILER_KEY ? '© MapTiler © OpenStreetMap contributors' : '© OpenStreetMap';

    const tl = L.tileLayer(initialUrl, {
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      attribution: initialAttribution,
    }).addTo(map);
    tileLayerRef.current = tl;

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

  // Toggle satellite/street tiles
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const streetsUrl = MAPTILER_KEY
      ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const satelliteUrl = MAPTILER_KEY
      ? `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newUrl = isSatellite ? satelliteUrl : streetsUrl;
    // Remove old and add new tileLayer
    try {
      mapRef.current.removeLayer(tileLayerRef.current!);
    } catch (e) {
      // ignore
    }
    const newTl = L.tileLayer(newUrl, {
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      attribution: MAPTILER_KEY ? '© MapTiler © OpenStreetMap contributors' : '© OpenStreetMap',
    }).addTo(mapRef.current);
    tileLayerRef.current = newTl;
  }, [isSatellite]);

  // Handle Map Click
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      // Strict two-marker system:
      // 1st click -> set origin (green)
      // 2nd click -> set destination (red)
      // 3rd click (after both exist) -> RESET and treat as new origin
      setRouteCache(null);

      setMarkers((prev) => {
        // If no origin, set origin (remove previous origin if any)
        if (!prev.origin && !prev.destination) {
          if (originRef.current) originRef.current.remove();

          const m = createMarker(e.latlng, 'origin', true);
          originRef.current = m;
          reverseGeocode(e.latlng, 'origin');
          toast.dismiss();
          toast.success('📍 Origin set');
          return { origin: m, destination: null };
        }

        // If origin exists but no destination, set destination
        if (prev.origin && !prev.destination) {
          if (destinationRef.current) destinationRef.current.remove();

          const m = createMarker(e.latlng, 'destination');
          destinationRef.current = m;
          reverseGeocode(e.latlng, 'destination');
          toast.dismiss();
          toast.success('🎯 Destination set');
          // draw a temporary straight line until ORS responds
          if (prev.origin && m) drawRouteLine(prev.origin.getLatLng(), m.getLatLng());
          return { ...prev, destination: m };
        }

        // Both exist -> reset markers and set new origin at clicked location
        if (prev.origin && prev.destination) {
          resetMapState();

          setFromText('Getting location...');
          setToText('Tap on map');

          const m = createMarker(e.latlng, 'origin', true);
          originRef.current = m;

          reverseGeocode(e.latlng, 'origin');
          toast.dismiss();
          toast.success('📍 Origin set');
          return { origin: m, destination: null };
        }

        return prev;
      });
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [createMarker, drawRouteLine, reverseGeocode, resetMapState]);

  // When both markers exist, attempt to fetch the ORS route and draw it (caches result)
  useEffect(() => {
    const tryRoute = async () => {
      if (!markers.origin || !markers.destination) return;
      const o = markers.origin.getLatLng();
      const d = markers.destination.getLatLng();

      // use ORS routing util — must use ORS; no straight-line fallback
      const route = await getRouteFromORS(o, d);
      if (route && route.distanceMeters != null && route.coords && route.coords.length) {
        setRouteCache(route as any);
        const routeLatLngs = route.coords.map((c: number[]) => L.latLng(c[1], c[0]));
        drawRoutePolyline(routeLatLngs);
      } else {
        // Routing failed — inform the user and clear any drawn temporary line
        toast.error('Routing failed: OpenRouteService did not return a route.');
        if (routeLineRef.current) {
          routeLineRef.current.remove();
          routeLineRef.current = null;
        }
      }
    };

    tryRoute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers.origin, markers.destination]);

  // Calculate Fare
  const handleCalculate = useCallback(() => {
    if (!markers.origin || !markers.destination) {
      toast.error('Please set both origin and destination');
      return;
    }
    const origin = markers.origin.getLatLng();
    const dest = markers.destination.getLatLng();

    (async () => {
      // Must have ORS route available — do not fall back to straight-line
      let route = routeCache as any;
      if (!route || !route.distanceMeters) {
        route = await getRouteFromORS(origin, dest);
        if (!route || !route.distanceMeters) {
          toast.error('Routing failed: cannot calculate fare without a valid road route.');
          return;
        }
        setRouteCache(route as any);
      }
      const distKm = (route.distanceMeters as number) / 1000;
      const routeLatLngs = route.coords.map((c: number[]) => [c[1], c[0]]);

      // Compute fare using local rule
      const { fare, roundedDistance } = calculateFare(distKm);

      const finalResult: FareCalculation = {
        fare,
        routeName: 'Map Route',
        distance: roundedDistance,
        passengerType,
        gasPrice,
        hasBaggage,
        regularFare: fare,
        studentFare: fare,
        rateUsed: 2,
      };

      const finalResultWithGeometry: any = {
        ...finalResult,
        routeGeometry: routeLatLngs,
        durationSec: route.duration ?? null,
      };

      onCalculate(finalResultWithGeometry);
      setFareResult(finalResult);
      setIsModalOpen(true);
      toast.dismiss();

    })();
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
          onClick={() => {
            logHistoryOpened('map');
            setIsHistoryVisible(true);
          }}
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
        {/* Satellite Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsSatellite((s) => !s);
            toast.dismiss();
            toast(`Tile: ${!isSatellite ? 'Satellite' : 'Streets'}`);
          }}
          className="w-12 h-12 rounded-full shadow-lg bg-white hover:bg-gray-100 flex items-center justify-center"
          title="Toggle Satellite"
        >
          🛰️
        </button>
        {/* Locate Button */}
        <button
          type="button"
          onClick={() => {
            getUserLocation();
          }}
          className="w-12 h-12 rounded-full shadow-lg bg-white hover:bg-gray-100 flex items-center justify-center"
          title="Locate Me"
        >
          📡
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

      <HistorySheet
        isOpen={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        onClearHistory={() => {
          logHistoryCleared();
          clearHistory();
          setIsHistoryVisible(false);
        }}
        history={history}
        title="Map Calculation History"
      />
    </div>
  );
}