// src/services/analytics.ts

import { analytics } from '../lib/firebase';
import { PassengerType } from '../lib/types';
import { logEvent } from 'firebase/analytics';

/**
 * Normalizes a location string for consistent analytics.
 * Converts to lowercase and trims whitespace.
 * @param location The location string to normalize.
 */
const normalizeLocation = (location: string): string => location.trim().toLowerCase();

/**
 * Logs a custom event to Firebase Analytics when a fare is calculated.
 * This function should be called whenever a user gets a fare result.
 *
 * @param origin The starting point of the route.
 * @param destination The ending point of the route.
 * @param mode The calculation mode used ('route' or 'toggle').
 * @param passengerType The type of passenger ('regular' or 'student').
 */
export function logFareCalculation(origin: string, destination:string, mode: 'route' | 'toggle' | 'map', passengerType: PassengerType) {
  // Check if analytics is enabled before logging
  if (analytics) {
    logEvent(analytics, 'calculate_fare', {
      calculation_mode: mode,
      origin: normalizeLocation(origin),
      destination: normalizeLocation(destination),
      passengerType: passengerType, // Use camelCase for consistency
    });
  }
}

/**
 * Logs an event when the app is opened via a QR code scan.
 * This should be called on page load if a specific query parameter is detected.
 */
export function logQrCodeScan() {
  if (analytics) {
    logEvent(analytics, 'qr_code_scan');
  }
}

/**
 * Logs an event when the user clicks the 'Support Us' button.
 */
export function logSupportButtonClick() {
  if (analytics) {
    logEvent(analytics, 'support_button_click');
  }
}

/**
 * Logs an event when the user opens the history panel.
 * @param mode The mode ('route' or 'map') from which the history was opened.
 */
export function logHistoryOpened(mode: 'route' | 'map') {
  if (analytics) {
    logEvent(analytics, 'history_opened', {
      history_mode: mode,
    });
  }
}

/**
 * Logs an event when the user clears their calculation history.
 */
export function logHistoryCleared() {
  if (analytics) {
    logEvent(analytics, 'history_cleared');
  }
}

/**
 * Logs an event when the user switches between calculation modes.
 * @param toMode The mode the user switched to ('route' or 'map').
 */
export function logModeSwitched(toMode: 'route' | 'map') {
  if (analytics) {
    logEvent(analytics, 'mode_switched', {
      to_mode: toMode,
    });
  }
}

/**
 * Logs an event when the user dismisses the 'Support Us' button.
 */
export function logSupportButtonDismissed() {
  if (analytics) {
    logEvent(analytics, 'support_button_dismissed');
  }
}