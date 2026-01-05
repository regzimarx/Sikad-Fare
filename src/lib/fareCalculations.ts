import { PassengerType } from './types';

/**
 * Midsayap Ordinance 536 Advanced Variable Step Logic:
 * Patterns discovered from Official Matrix:
 * - Regular: P1.00 shift (Gas < 71), P2.00 shift (Gas >= 71)
 * - Discounted: P0.80 shift (Gas < 71), P1.60 shift (Gas >= 71)
 */
export function getFareByGasPrice(
  gasPrice: number,
  baseRegular: number,
  baseStudent: number,
  passengerType: PassengerType
): number {
  const anchorPrice = 80; // Anchor column (P71-P80)
  const isDiscounted = ['student', 'senior', 'pwd'].includes(passengerType.type);
  
  let adjustedFare = isDiscounted ? baseStudent : baseRegular;
  let currentBracket = anchorPrice;

  // Moving DOWN from Anchor (e.g., to Today's P51-P60)
  while (currentBracket > gasPrice) {
    let stepValue: number;
    
    if (currentBracket > 71) {
      // High Gas Threshold: Regular P2.00 / Discounted P1.60
      stepValue = isDiscounted ? 1.60 : 2.00;
    } else {
      // Low Gas Threshold: Regular P1.00 / Discounted P0.80
      stepValue = isDiscounted ? 0.80 : 1.00;
    }
    
    adjustedFare -= stepValue;
    currentBracket -= 10;
  }

  // Moving UP from Anchor
  while (currentBracket < gasPrice - 10) {
    currentBracket += 10;
    let stepValue: number;
    
    if (currentBracket >= 71) {
      stepValue = isDiscounted ? 1.60 : 2.00;
    } else {
      stepValue = isDiscounted ? 0.80 : 1.00;
    }
    
    adjustedFare += stepValue;
  }

  // Rounding Logic:
  // For Regulars, we round to whole Pesos.
  // For Discounted, we round to 1 decimal place (e.g., .40 or .80)
  return isDiscounted 
    ? Math.round(adjustedFare * 10) / 10 
    : Math.round(adjustedFare);
}

/**
 * Map-based fare calculation for custom points
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
  // Account for road winding/curves
  const estimatedRoadDistKm = distKm * 1.08;
  
  // Base Rate (Anchor P71-P80)
  // Ordinance flag-down equivalent logic: P15.00 for first 1.5km
  let baseRegular = 15.00;
  if (estimatedRoadDistKm > 1.5) {
    baseRegular += Math.ceil(estimatedRoadDistKm - 1.5) * 2.00;
  }
  
  const baseStudent = baseRegular * 0.8; // Standard 20% discount

  const unitRegular = getFareByGasPrice(gasPrice, baseRegular, baseStudent, { type: 'regular', quantity: 1 });
  const unitStudent = getFareByGasPrice(gasPrice, baseRegular, baseStudent, { type: 'student', quantity: 1 });

  let finalFare = (passengerType.type === 'regular' ? unitRegular : unitStudent) * passengerType.quantity;

  if (hasBaggage) {
    finalFare += 10; // Section 3.e flat fee
  }
  
  return {
    fare: finalFare,
    regularFare: unitRegular,
    studentFare: unitStudent,
    estimatedRoadDist: estimatedRoadDistKm
  };
}