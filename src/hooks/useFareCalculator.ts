"use client";

import { useState, useCallback, useEffect } from 'react';
import { CalculatorState, CalculationMode, PassengerType, FareCalculation, HistoryEntry } from '../lib/types';
import { findRoute, normalizeName, midsayapProper } from '../lib/routeData';
import { getFareByGasPrice } from '../lib/fareCalculations';
import toast from 'react-hot-toast';

const getInitialState = (): CalculatorState => {
  let storedHistory: HistoryEntry[] = [];
  if (typeof window !== 'undefined') {
    try {
      const item = window.localStorage.getItem('fareHistory');
      storedHistory = item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading history from localStorage', error);
      storedHistory = [];
    }
  }

  return {
    mode: 'route',
    origin: '',
    destination: '',
    gasPrice: 60,
    passengerType: { type: 'student', quantity: 1 },
    hasBaggage: false,
    result: null,
    error: null,
    history: storedHistory,
  };
};

export function useFareCalculator() {
  const [state, setState] = useState<CalculatorState>(getInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem('fareHistory', JSON.stringify(state.history));
    } catch (error) {
      console.error('Error saving history to localStorage', error);
    }
  }, [state.history]);

  const setMode = useCallback((mode: CalculationMode) => {
    setState(prev => ({ ...prev, mode, result: null }));
  }, []);

  const setOrigin = useCallback((origin: string) => {
    setState(prev => {
      // If the new origin is the same as the current destination, clear the destination.
      // Otherwise, keep the destination.
      const newDestination = origin === prev.destination ? '' : prev.destination;
      return { ...prev, origin, destination: newDestination };
    });
  }, []);

  const setDestination = useCallback((destination: string) => {
    setState(prev => ({ ...prev, destination }));
  }, []);

  const setGasPrice = useCallback((gasPrice: number) => {
    setState(prev => ({ ...prev, gasPrice }));
  }, []);

  const setPassengerType = useCallback((passengerType: Partial<PassengerType>) => {
    setState(prev => ({ ...prev, passengerType: { ...prev.passengerType, ...passengerType } }));
  }, []);

  const setHasBaggage = useCallback((hasBaggage: boolean) => {
    setState(prev => ({ ...prev, hasBaggage }));
  }, []);

  const addResultToHistory = useCallback((calculationResult: FareCalculation) => {
    const newEntry: HistoryEntry = {
      id: new Date().toISOString(), // Simple unique ID
      ...calculationResult,
    };
    // Add to the beginning of the array and limit history size to 50
    setState(prev => ({ ...prev, history: [newEntry, ...prev.history].slice(0, 50) }));
  }, []);

  const calculateFare = useCallback(() => {
    const { origin, destination, gasPrice, passengerType, hasBaggage } = state;

    // Validation
    if (!origin || !destination) {
      toast.error('Please select both origin and destination');
      setState(prev => ({ ...prev, result: null }));
      return null;
    }

    if (origin === destination) {
      toast.error('Origin and destination cannot be the same');
      setState(prev => ({ ...prev, result: null }));
      return null;
    }

    // Find route
    const route = findRoute(origin, destination);

    // Check if within town proper
    const isOriginProper = midsayapProper.includes(origin);
    const isDestProper = midsayapProper.includes(destination);

    if (!route && isOriginProper && isDestProper) {
      // Within town proper fare
      const withinTownFare = getFareByGasPrice(gasPrice, 15.00, 12.00, passengerType);
      const finalFare = hasBaggage ? withinTownFare + 10 : withinTownFare;

      const result: FareCalculation = {
        fare: finalFare,
        routeName: `${origin} → ${destination}`,
        distance: 'Within Town Proper',
        passengerType,
        gasPrice,
        hasBaggage
      };

      setState(prev => ({ ...prev, result }));
      addResultToHistory(result);
      return result;
    }

    if (!route) {
      toast.error('Route not found. Please use Map mode for custom routes.');
      setState(prev => ({ ...prev, result: null }));
      return null;
    }

    // Calculate fare
    let fare = getFareByGasPrice(gasPrice, route.baseRegular, route.baseStudent, passengerType);
    
    if (hasBaggage) {
      fare += 10;
    }

    const result: FareCalculation = {
      fare,
      routeName: `${normalizeName(origin)} → ${normalizeName(destination)}`,
      distance: route.distance,
      passengerType,
      gasPrice,
      hasBaggage
    };

    setState(prev => ({ ...prev, result }));
    addResultToHistory(result);
    return result;
  }, [state, addResultToHistory]);

  const setMapResult = useCallback((result: FareCalculation) => {
    setState(prev => ({ ...prev, result }));
  }, []);

  const setError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      origin: '',
      destination: '',
      gasPrice: 60,
      passengerType: { type: 'student', quantity: 1 },
      hasBaggage: false,
      result: null,
      error: null,
    }));
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
    setMapResult,
    reset,
    setError,
    clearHistory,
  };
}