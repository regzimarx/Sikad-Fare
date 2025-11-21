// Type definitions for Sikad Fare Calculator

export interface Route {
  distance: number;
  baseRegular: number;
  baseStudent: number;
}

export interface RouteMatrix {
  [key: string]: Route;
}

export type DiscountedPassenger = 'student' | 'senior' | 'pwd';

export type PassengerType = {
  type: 'regular' | DiscountedPassenger;
  quantity: number;
};

export type CalculationMode = 'route' | 'map';

export interface FareCalculation {
  fare: number;
  routeName: string;
  distance: number | string;
  passengerType: PassengerType;
  gasPrice: number;
  hasBaggage: boolean;
  regularFare?: number;
  studentFare?: number;
  rateUsed?: number;
}

export interface HistoryEntry extends FareCalculation {
  id: string;
  timestamp: string;
}

export interface GasPriceOption {
  value: number;
  label: string;
}

export interface MapMarker {
  lat: number;
  lng: number;
}

export interface CalculatorState {
  mode: CalculationMode;
  origin: string;
  destination: string;
  gasPrice: number;
  passengerType: PassengerType;
  hasBaggage: boolean;
  result: FareCalculation | null;
  error: string | null;
  history: HistoryEntry[];
}