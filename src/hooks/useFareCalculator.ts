"use client";

import { useState, useCallback, useEffect } from 'react';
import { 
  CalculatorState, 
  CalculationMode, 
  PassengerType, 
  FareCalculation, 
  HistoryEntry 
} from '../lib/types';
import { findRoute, normalizeName, midsayapProper } from '../lib/routeData';
import { getFareByGasPrice } from '../lib/fareCalculations';
import toast from 'react-hot-toast';

// Section 3.e: Baggage fee is fixed at P10.00 per ordinance
const OFFICIAL_BAGGAGE_FEE = 10.00;

const initialCalculatorState: CalculatorState = {
  mode: 'route',
  origin: '',
  destination: '',
  gasPrice: 60, // Default to P51-P60 range
  passengerType: { type: 'regular', quantity: 1 },
  hasBaggage: false,
  result: null,
  error: null,
  history: [],
};

export function useFareCalculator() {
  const [state, setState] = useState<CalculatorState>(initialCalculatorState);

  // --- Persistence Logic ---
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('fareHistory');
      if (item) {
        setState(prev => ({ ...prev, history: JSON.parse(item) }));
      }
    } catch (e) {
      console.error('History load failed', e);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('fareHistory', JSON.stringify(state.history));
  }, [state.history]);

  // --- History Helper ---
  const addResultToHistory = useCallback((calculationResult: FareCalculation) => {
    setState(prev => {
      const newEntry: HistoryEntry = {
        id: new Date().getTime().toString(),
        timestamp: new Date().toISOString(),
        ...calculationResult,
      };
      return { ...prev, history: [newEntry, ...prev.history].slice(0, 50) };
    });
  }, []);

  // --- State Handlers ---
  const setOrigin = useCallback((origin: string) => {
    setState(prev => {
      const newDestination = origin === prev.destination ? '' : prev.destination;
      return { ...prev, origin, destination: newDestination, result: null };
    });
  }, []);

  const setDestination = useCallback((destination: string) => {
    setState(prev => ({ ...prev, destination, result: null }));
  }, []);

  const setGasPrice = useCallback((gasPrice: number) => {
    setState(prev => ({ ...prev, gasPrice, result: null }));
  }, []);

  const setPassengerType = useCallback((passengerType: Partial<PassengerType>) => {
    setState(prev => ({ 
      ...prev, 
      passengerType: { ...prev.passengerType, ...passengerType },
      result: null 
    }));
  }, []);

  const setHasBaggage = useCallback((hasBaggage: boolean) => {
    setState(prev => ({ ...prev, hasBaggage, result: null }));
  }, []);

  const setMode = useCallback((mode: CalculationMode) => {
    setState(prev => ({ ...prev, mode, result: null }));
  }, []);

  // --- Core Calculation Logic ---
  const calculateFare = useCallback(() => {
    const { origin, destination, gasPrice, passengerType, hasBaggage } = state;

    // 1. Validation
    if (!origin || !destination) {
      toast.error('Please select both origin and destination');
      return null;
    }
    if (origin === destination) {
      toast.error('Origin and destination cannot be the same');
      return null;
    }

    // 2. Logic Flags
    const isOriginProper = midsayapProper.includes(origin);
    const isDestProper = midsayapProper.includes(destination);

    // 3. Smart Route Search (Normalizing "Poblacion" to "Town Proper")
    let route = findRoute(origin, destination);

    if (!route) {
      if (isOriginProper && !isDestProper) {
        route = findRoute("Town Proper", destination);
      } else if (!isOriginProper && isDestProper) {
        route = findRoute(origin, "Town Proper");
      }
    }

    let result: FareCalculation | null = null;

    // Case A: Within Town Proper (Pob to Pob)
    if (isOriginProper && isDestProper) {
      const baseRegular = 15.00;
      const baseDiscounted = 12.00;
      
      const scaledFare = getFareByGasPrice(gasPrice, baseRegular, baseDiscounted, passengerType);
      const finalFare = (scaledFare * passengerType.quantity) + (hasBaggage ? OFFICIAL_BAGGAGE_FEE : 0);

      result = {
        fare: finalFare,
        routeName: `${origin} → ${destination}`,
        distance: 'Within Town Proper',
        passengerType,
        gasPrice,
        hasBaggage,
        regularFare: baseRegular,
        studentFare: baseDiscounted,
      };
    } 
    // Case B: Barangay Route Found
    else if (route) {
      const baseFare = getFareByGasPrice(gasPrice, route.baseRegular, route.baseStudent, passengerType);
      const finalFare = (baseFare * passengerType.quantity) + (hasBaggage ? OFFICIAL_BAGGAGE_FEE : 0);

      result = {
        fare: finalFare,
        routeName: `${normalizeName(origin)} → ${normalizeName(destination)}`,
        distance: route.distance,
        passengerType,
        gasPrice,
        hasBaggage,
        regularFare: route.baseRegular,
        studentFare: route.baseStudent,
      };
    } 
    // Case C: No data
    else {
      toast.error('Route not found in Tarifa. Check if Barangay is spelled correctly.');
      return null;
    }

    if (result) {
      setState(prev => ({ ...prev, result }));
      addResultToHistory(result);
    }
    
    return result;
  }, [state, addResultToHistory]);

  const reset = useCallback(() => {
    setState(prev => ({ ...initialCalculatorState, history: prev.history }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
    toast.success('History cleared!');
  }, []);

  return {
    state,
    setMode,
    setOrigin,
    setDestination,
    setGasPrice,
    setPassengerType,
    setHasBaggage,
    calculateFare,
    reset,
    clearHistory,
  };
}