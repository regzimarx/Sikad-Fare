import { RouteMatrix, Route, GasPriceOption } from './types';


export const gasPriceOptions: GasPriceOption[] = [
  { value: 40, label: "₱31.00 – ₱40.00" },
  { value: 50, label: "₱41.00 – ₱50.00" },
  { value: 60, label: "₱51.00 – ₱60.00" }, // Today's Price Range
  { value: 70, label: "₱61.00 – ₱70.00" },
  { value: 80, label: "₱71.00 – ₱80.00" }, // The "Anchor" Price 
  { value: 90, label: "₱81.00 – ₱90.00" },
  { value: 100, label: "₱91.00 – ₱100.00" },
  { value: 110, label: "₱101.00 – ₱110.00" }
];
/**
 * Data mapped from Midsayap Ordinance No. 536.
 */
export const baseRoutes: RouteMatrix = {
  // Page 3: Villarica/Nalin-Libungan
  "Town Proper-Villarica": { distance: 4.30, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-Sadaan": { distance: 3.56, baseRegular: 16.00, baseStudent: 12.80 },
  "Town Proper-Libungan Proper": { distance: 7.23, baseRegular: 25.00, baseStudent: 20.00 },
  
  // Page 3: Kimagango/Arizona
  "Town Proper-Kimagango": { distance: 5.21, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Arizona": { distance: 7.63, baseRegular: 27.00, baseStudent: 21.60 },
  
  // Page 4: Agriculture/Salunayan
  "Town Proper-Agriculture": { distance: 5.01, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Salunayan": { distance: 5.76, baseRegular: 23.00, baseStudent: 18.40 },
  
  // Page 4: Anonang/Barongis
  "Town Proper-Anonang": { distance: 8.50, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-Barongis": { distance: 9.57, baseRegular: 30.00, baseStudent: 24.00 },
  
  // Page 5: Palongoguen/Rangaban/Kiwanan
  "Town Proper-Palongoguen": { distance: 6.55, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Rangaban": { distance: 7.10, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Kiwanan": { distance: 6.46, baseRegular: 24.00, baseStudent: 19.20 },
  "Town Proper-Baliki": { distance: 7.24, baseRegular: 25.00, baseStudent: 20.00 },
  
  // Page 6: Aleosan
  "Town Proper-Aleosan": { distance: 8.62, baseRegular: 29.00, baseStudent: 23.20 }
};

// These are required for your RouteMode.tsx component
export const midsayapProper = [
  "Pob 1", "Pob 2", "Pob 3", "Pob 4", 
  "Pob 5", "Pob 6", "Pob 7", "Pob 8",
  "Public Market", "Town Hall"
].sort();

export const outsideMidsayap = [
  "Agriculture", "Aleosan", "Anonang", "Arizona", 
  "Baliki", "Barongis",
  "Kimagango", "Kiwanan", "Libungan Proper", 
  "Palongoguen", "Rangaban", "Sadaan", 
  "Salunayan", "Villarica"
].sort();

export function normalizeName(name: string): string {
  if (!name) return "";
  const n = name.trim().toLowerCase();
  const properAliases = ["town proper", "midsayap proper", "poblacion"];
  if (properAliases.some(alias => n.includes(alias))) return "Town Proper";
  return n.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function findRoute(origin: string, destination: string): Route | null {
  const normOrigin = normalizeName(origin);
  const normDest = normalizeName(destination);
  
  // Create key in format "Town Proper-Location"
  const key = normOrigin === "Town Proper" ? `Town Proper-${normDest}` : `Town Proper-${normOrigin}`;
  return baseRoutes[key] || null;
}