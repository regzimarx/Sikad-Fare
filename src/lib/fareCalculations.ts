import { PassengerType } from './types';

// Calculate fare multiplier based on gas price
export function getFareMultiplier(gasPrice: number): number {
  if (gasPrice >= 101) return 1.6;
  if (gasPrice >= 91) return 1.5;
  if (gasPrice >= 81) return 1.4;
  if (gasPrice >= 71) return 1.3;
  if (gasPrice >= 61) return 1.2;
  if (gasPrice >= 51) return 1.0;
  if (gasPrice >= 41) return 0.9;
  return 0.8;
}

// Calculate fare based on gas price and passenger type
export function getFareByGasPrice(
  gasPrice: number,
  baseRegular: number,
  baseStudent: number,
  passengerType: PassengerType
): number {
  const multiplier = getFareMultiplier(gasPrice);
  const fare = passengerType.type === 'student' 
    ? baseStudent * multiplier 
    : baseRegular * multiplier;
  return fare * passengerType.quantity;
}

// Haversine distance formula (returns km)
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  function toRad(x: number) {
    return (x * Math.PI) / 180;
  }
  
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate map-based fare
export function calculateMapFare(
  distKm: number,
  gasPrice: number,
  passengerType: PassengerType,
  hasBaggage: boolean
): {
  fare: number;
  regularFare: number;
  studentFare: number;
  rateUsed: number;
  estimatedRoadDist: number;
} {
  // Apply 8% multiplier for road curves
  const estimatedRoadDistKm = distKm * 1.08;
  
  let ratePerKm = 4.34;
  if (gasPrice >= 80) ratePerKm *= 1.1;
  if (gasPrice >= 90) ratePerKm *= 1.2;
  
  let regularFare: number;
  let studentFare: number;
  
  // Minimum fare for distances under 1 km
  if (estimatedRoadDistKm < 1) {
    const baseMinRegular = 15.00;
    const baseMinStudent = 12.00;
    regularFare = getFareByGasPrice(gasPrice, baseMinRegular, baseMinStudent, { type: 'regular', quantity: 1 });
    studentFare = getFareByGasPrice(gasPrice, baseMinRegular, baseMinStudent, { type: 'student', quantity: 1 });
  } else {
    regularFare = estimatedRoadDistKm * ratePerKm;
    studentFare = regularFare * 0.8;
  }
  
  // Add surcharge for distances beyond 2km
  if (estimatedRoadDistKm > 2) {
    const surcharge = Math.ceil(estimatedRoadDistKm - 2) * 2.00;
    regularFare += surcharge;
    studentFare += surcharge;
  }
  
  // Determine fare based on passenger type and quantity FIRST
  let fare = passengerType.type === 'student' 
    ? studentFare * passengerType.quantity 
    : regularFare * passengerType.quantity;

  // Add baggage fee AFTER calculating total passenger fare
  if (hasBaggage) {
    fare += 10;
  }
  
  return {
    fare,
    regularFare,
    studentFare,
    rateUsed: ratePerKm,
    estimatedRoadDist: estimatedRoadDistKm
  };
}