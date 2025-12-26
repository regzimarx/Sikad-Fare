import { PassengerType } from './types';

/**
 * According to Ordinance 536, fares shift by P1.00 for every P10.00 gas change.
 * Our base data in routeData.ts uses the P71-P80 bracket (Anchor: 80).
 */
export function getFareByGasPrice(
  gasPrice: number,
  baseRegular: number,
  baseStudent: number,
  passengerType: PassengerType
): number {
  const anchorPrice = 80; // The "Standard" bracket in your data
  
  // Calculate how many steps of P10.00 we are away from the anchor
  // If gas is 55 (Today), steps = (80 - 60) / 10 = 2 steps DOWN.
  const steps = Math.floor((anchorPrice - gasPrice) / 10);
  
  const isDiscounted = ['student', 'senior', 'pwd'].includes(passengerType.type);
  const baseFare = isDiscounted ? baseStudent : baseRegular;

  // Apply the flat P1.00 adjustment per step
  let adjustedFare = baseFare - (steps * 1.00);

  // Apply quantity and round to nearest whole peso for local compliance
  return Math.round(adjustedFare) * passengerType.quantity;
}

/**
 * Map-based fare calculation for routes not defined in the ordinance.
 */
export function calculateMapFare(
  distKm: number,
  gasPrice: number,
  passengerType: PassengerType,
  hasBaggage: boolean
): {
  fare: number;
  regularFare: number;
  studentFare: number;
  estimatedRoadDist: number;
} {
  // 1. Account for road curves (8% increase over straight-line distance)
  const estimatedRoadDistKm = distKm * 1.08;
  
  // 2. Base Rate: Using a standard P15.00 flag-down for the first 1.5km
  // and P2.00 per succeeding km (common provincial standard)
  let baseRegular = 15.00;
  if (estimatedRoadDistKm > 1.5) {
    baseRegular += Math.ceil(estimatedRoadDistKm - 1.5) * 2.00;
  }
  
  const baseStudent = Math.floor(baseRegular * 0.8); // Strict 20% discount

  // 3. Adjust for current gas price using the Step Logic
  const regularFare = getFareByGasPrice(gasPrice, baseRegular, baseStudent, { type: 'regular', quantity: 1 });
  const studentFare = getFareByGasPrice(gasPrice, baseRegular, baseStudent, { type: 'student', quantity: 1 });

  let finalFare = (passengerType.type === 'regular' ? regularFare : studentFare) * passengerType.quantity;

  // 4. Section 3.e: Add baggage fee
  if (hasBaggage) {
    finalFare += 10;
  }
  
  return {
    fare: finalFare,
    regularFare,
    studentFare,
    estimatedRoadDist: estimatedRoadDistKm
  };
}

