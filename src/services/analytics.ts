// src/services/analytics.ts

import { analytics } from '../lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * Logs a custom event to Firebase Analytics when a fare is calculated.
 * This function should be called whenever a user gets a fare result.
 *
 * @param origin The starting point of the route.
 * @param destination The ending point of the route.
 * @param mode The calculation mode used ('route' or 'toggle').
 */
export function logFareCalculation(origin: string, destination:string, mode: 'route' | 'toggle' | 'map') {
  // Check if analytics is enabled before logging
  if (analytics) {
    logEvent(analytics, 'calculate_fare', {
      calculation_mode: mode,
      origin: origin,
      destination: destination,
    });
  }
}