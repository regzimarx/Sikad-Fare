import { RouteMatrix, Route, GasPriceOption } from './types';

// Base routes from Ordinance No. 536
export const baseRoutes: RouteMatrix = {
  "Town Proper-Villarica": { distance: 4.3, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Sadaan": { distance: 3.56, baseRegular: 18.00, baseStudent: 14.76 },
  "Town Proper-Arizona": { distance: 7.63, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-Kimagango": { distance: 5.21, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Rangaban": { distance: 7.50, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-Kiwanan": { distance: 6.46, baseRegular: 18.00, baseStudent: 14.76 },
  "Town Proper-Aleosan": { distance: 9.03, baseRegular: 23.00, baseStudent: 18.86 },
  "Town Proper-Agriculture": { distance: 5.01, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Salunayan": { distance: 5.76, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-San Isidro": { distance: 3.63, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Damatug": { distance: 5.72, baseRegular: 23.00, baseStudent: 18.43 },
  "Town Proper-Anonang": { distance: 8.50, baseRegular: 30.00, baseStudent: 24.00 },
  "Town Proper-Barongis": { distance: 9.57, baseRegular: 32.00, baseStudent: 25.60 },
  "Town Proper-Libungan Proper": { distance: 7.23, baseRegular: 25.00, baseStudent: 21.60 },
  "Town Proper-Palongoguen": { distance: 26.55, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Bagumba": { distance: 4.48, baseRegular: 20.00, baseStudent: 16.80 },
  "Town Proper-Baliki": { distance: 7.24, baseRegular: 25.00, baseStudent: 20.00 }
};

// Short routes within town
export const townRoutes: RouteMatrix = {
  "Public Market-Town Hall": { distance: 0.8, baseRegular: 15.00, baseStudent: 12.00 }
};

// Gas price options
export const gasPriceOptions: GasPriceOption[] = [
  { value: 40, label: "₱30–40" },
  { value: 50, label: "₱41–50" },
  { value: 60, label: "₱51–60" },
  { value: 70, label: "₱61–70" },
  { value: 80, label: "₱71–80" },
  { value: 90, label: "₱81–90" },
  { value: 100, label: "₱91–100" },
  { value: 110, label: "₱101–110" }
];

// Midsayap town proper locations
export const midsayapProper = [
  "Pob 1",
  "Pob 2",
  "Pob 3",
  "Pob 4",
  "Pob 5",
  "Pob 6",
  "Pob 7",
  "Pob 8",
  "Public Market",
  "Town Hall",
].sort();

// Outside Midsayap locations
export const outsideMidsayap = [
  "Agriculture",
  "Aleosan",
  "Anonang",
  "Arizona",
  "Bagumba",
  "Baliki",
  "Barongis",
  "Damatug",
  "Kimagango",
  "Kiwanan",
  "Libungan Proper",
  "Palongoguen",
  "Rangaban",
  "Sadaan",
  "Salunayan",
  "San Isidro",
  "Villarica",
].sort();

// Normalize location names
export function normalizeName(name: string): string {
  if (!name) return "";
  name = name.trim();
  const properAliases = [
    "Town Proper",
    "Midsayap Proper",
    "Town Hall",
    "Public Market",
    "Poblacion",
    "Pob",
    "Centro",
    "Proper"
  ];
  if (properAliases.some(alias => name.toLowerCase().includes(alias.toLowerCase()))) {
    return "Town Proper";
  }
  if (name.toLowerCase().includes("agriculture")) return "Salunayan";
  if (name.toLowerCase().includes("salunayan")) return "Salunayan";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Generate bidirectional routes
export function getAllRoutes(): RouteMatrix {
  const allRoutes: RouteMatrix = {};
  
  Object.entries(baseRoutes).forEach(([key, value]) => {
    allRoutes[key] = value;
    const [a, b] = key.split("-");
    allRoutes[`${b}-${a}`] = value;
  });
  
  Object.entries(townRoutes).forEach(([key, value]) => {
    allRoutes[key] = value;
    const [a, b] = key.split("-");
    allRoutes[`${b}-${a}`] = value;
  });
  
  return allRoutes;
}

// Find route between two locations
export function findRoute(origin: string, destination: string): Route | null {
  const normalizedOrigin = normalizeName(origin);
  const normalizedDest = normalizeName(destination);
  const allRoutes = getAllRoutes();
  
  const routeKey = `${normalizedOrigin}-${normalizedDest}`;
  const reverseKey = `${normalizedDest}-${normalizedOrigin}`;
  
  return allRoutes[routeKey] || allRoutes[reverseKey] || null;
}