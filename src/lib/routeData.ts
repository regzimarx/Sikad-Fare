import { RouteMatrix, Route, GasPriceOption } from './types';

export const gasPriceOptions: GasPriceOption[] = [
  { value: 40, label: "₱31.00 – ₱40.00" },
  { value: 50, label: "₱41.00 – ₱50.00" },
  { value: 60, label: "₱51.00 – ₱60.00" },
  { value: 70, label: "₱61.00 – ₱70.00" },
  { value: 80, label: "₱71.00 – ₱80.00" }, // Official Anchor Bracket
  { value: 90, label: "₱81.00 – ₱90.00" },
  { value: 100, label: "₱91.00 – ₱100.00" },
  { value: 110, label: "₱101.00 – ₱110.00" }
];

export const baseRoutes: RouteMatrix = {
  // --- VILLARICA / NALIN-LIBUNGAN SECTION ---
  "Town Proper-Crossing Midsayap": { distance: 1.87, baseRegular: 15.00, baseStudent: 12.00 },
  "Town Proper-Dela Cruz/NFA/I-LINK": { distance: 2.52, baseRegular: 16.00, baseStudent: 12.80 },
  "Town Proper-Double Bridge": { distance: 2.93, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Crossing DPWH/COTELCO": { distance: 3.51, baseRegular: 18.00, baseStudent: 14.40 },
  "Town Proper-Crossing NIA": { distance: 3.86, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-DPWH Office": { distance: 3.90, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-Villarica School": { distance: 4.30, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-Crossing Abaga": { distance: 5.58, baseRegular: 22.00, baseStudent: 17.60 },
  "Town Proper-Crossing Panganod": { distance: 5.78, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Crossing Nalin 1": { distance: 5.79, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Nalin 2 (Barrio)": { distance: 5.81, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Nalin 1 (Barrio)": { distance: 6.30, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Libungan Proper": { distance: 7.23, baseRegular: 25.00, baseStudent: 20.00 },

  // --- SADAAN / ALEOSAN PROPER SECTION ---
  "Town Proper-BPH": { distance: 2.60, baseRegular: 16.00, baseStudent: 12.80 },
  "Town Proper-Sadaan": { distance: 3.56, baseRegular: 18.00, baseStudent: 14.40 },
  "Town Proper-Purok Rojas": { distance: 4.61, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Tres Rosas": { distance: 5.46, baseRegular: 22.00, baseStudent: 17.60 },
  "Town Proper-Crossing Tanhay": { distance: 6.17, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Sta. Cruz": { distance: 6.75, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Sta. Cruz (Barrio)": { distance: 6.88, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Bitoka": { distance: 7.98, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-KM. 49": { distance: 5.06, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Bridge": { distance: 5.97, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Dualing": { distance: 7.60, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-Aleosan Proper": { distance: 8.62, baseRegular: 29.00, baseStudent: 23.20 },

  // --- KIMAGANGO / ARIZONA SECTION ---
  "Town Proper-Green Valley": { distance: 3.39, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Kimagango": { distance: 5.21, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Escaguet": { distance: 5.58, baseRegular: 22.00, baseStudent: 17.60 },
  "Town Proper-Tugas": { distance: 5.59, baseRegular: 22.00, baseStudent: 17.60 },
  "Town Proper-Caingcoy": { distance: 5.77, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Balbuena": { distance: 6.67, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Toll House": { distance: 7.14, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Crossing Arizona": { distance: 7.63, baseRegular: 27.00, baseStudent: 21.60 },

  // --- ANONANG / BARONGIS SECTION ---
  "Town Proper-Crossing Libocean": { distance: 4.80, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Amanon": { distance: 7.00, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Anonang (Quirino)": { distance: 8.05, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-Madcel": { distance: 8.52, baseRegular: 28.00, baseStudent: 22.40 },
  "Town Proper-Barongis Kulambog": { distance: 9.57, baseRegular: 30.00, baseStudent: 24.00 },

  // --- SAN ISIDRO / LAGUMBINGAN / PATINDEGUEN / LABAS SECTION ---
  "Town Proper-Dol-Dol": { distance: 1.56, baseRegular: 15.00, baseStudent: 12.00 },
  "Town Proper-C-Katingawan": { distance: 2.88, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-San Isidro": { distance: 3.63, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-Lagumbingan": { distance: 5.51, baseRegular: 22.00, baseStudent: 17.60 },
  "Town Proper-Patindeguen": { distance: 5.88, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Labas": { distance: 8.59, baseRegular: 28.00, baseStudent: 22.40 },
  "Town Proper-Central Labas": { distance: 9.86, baseRegular: 31.00, baseStudent: 24.80 },
  "Town Proper-Namangkilan": { distance: 6.92, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Gayunga": { distance: 8.45, baseRegular: 28.00, baseStudent: 22.40 },
  "Town Proper-Tawi Tawi": { distance: 8.42, baseRegular: 27.00, baseStudent: 21.60 },

  // --- BAGUMBA / DAMATULAN / DAMATUG / ANDATUAN SECTION ---
  "Town Proper-Bugto": { distance: 2.56, baseRegular: 16.00, baseStudent: 12.80 },
  "Town Proper-Boundary": { distance: 2.82, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Bagumba": { distance: 4.48, baseRegular: 20.00, baseStudent: 16.00 },
  "Town Proper-Kawayan": { distance: 4.81, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Karpa": { distance: 5.36, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Damatug": { distance: 5.72, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Andatuan": { distance: 6.55, baseRegular: 25.00, baseStudent: 20.00 },

  // --- AGRICULTURE / SALUNAYAN / MUDSENG SECTION ---
  "Town Proper-Crossing Bual": { distance: 1.15, baseRegular: 15.00, baseStudent: 12.00 },
  "Town Proper-Kamansi": { distance: 2.21, baseRegular: 15.00, baseStudent: 12.00 },
  "Town Proper-Kurbada": { distance: 3.06, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Gallardo Res. To Ontal Res.": { distance: 4.27, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-Agriculture (Barrio)": { distance: 5.01, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Salunayan (Barrio)": { distance: 5.76, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-NES": { distance: 6.18, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Compact": { distance: 8.06, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-Mudseng": { distance: 8.22, baseRegular: 27.00, baseStudent: 21.60 },
  "Town Proper-Malingao (Oting)": { distance: 9.06, baseRegular: 31.00, baseStudent: 24.80 },

  // --- BUAL / PALONGOGUEN / MALINGAO SECTION ---
  "Town Proper-Bual Sur": { distance: 2.45, baseRegular: 16.00, baseStudent: 12.80 },
  "Town Proper-Bual Sur (Barrios)": { distance: 2.96, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Bual Norte": { distance: 3.75, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-School": { distance: 4.61, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Palongoguen": { distance: 6.55, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Crossing (Ostique)": { distance: 4.80, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Malingao": { distance: 7.97, baseRegular: 27.00, baseStudent: 21.60 },

  // --- GLAD / BALIKI / RANGEBAN SECTION ---
  "Town Proper-Glad 1": { distance: 2.49, baseRegular: 16.00, baseStudent: 12.80 },
  "Town Proper-Glad 2": { distance: 3.39, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Central Bulanan": { distance: 4.50, baseRegular: 20.00, baseStudent: 16.00 },
  "Town Proper-Baliki": { distance: 7.24, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Central Glad": { distance: 2.58, baseRegular: 16.00, baseStudent: 12.80 },
  "Town Proper-San Pedro": { distance: 5.36, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Fatima": { distance: 5.14, baseRegular: 21.00, baseStudent: 16.80 },
  "Town Proper-Lower Glad": { distance: 3.99, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-Rangaban": { distance: 7.10, baseRegular: 25.00, baseStudent: 20.00 },
  "Town Proper-Rangaban 3": { distance: 7.50, baseRegular: 16.00, baseStudent: 12.80 },

  // --- RIVER SIDE SECTION ---
  "Town Proper-Crossing Tumbras": { distance: 6.40, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Kapinpilan": { distance: 9.45, baseRegular: 30.00, baseStudent: 24.00 },
  "Town Proper-Panangalang": { distance: 11.13, baseRegular: 33.00, baseStudent: 26.40 },
  "Town Proper-Ipil-Ipil": { distance: 12.39, baseRegular: 35.00, baseStudent: 28.00 },
  "Town Proper-Sambulawan": { distance: 11.04, baseRegular: 33.00, baseStudent: 26.40 },

  // --- KIWANAN SECTION ---
  "Town Proper-Silver Homes": { distance: 2.83, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Ignacio": { distance: 2.91, baseRegular: 17.00, baseStudent: 13.60 },
  "Town Proper-Coop": { distance: 3.73, baseRegular: 19.00, baseStudent: 15.20 },
  "Town Proper-Upper Kiwanan": { distance: 5.72, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Agulo": { distance: 6.41, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Singit": { distance: 6.46, baseRegular: 24.00, baseStudent: 19.20 },

  // --- ALEOSAN SECTION ---
  "Town Proper-Tay-Tay Bulanan": { distance: 5.94, baseRegular: 23.00, baseStudent: 18.40 },
  "Town Proper-Planta": { distance: 6.47, baseRegular: 24.00, baseStudent: 19.20 },
  "Town Proper-Mampurok": { distance: 9.32, baseRegular: 29.00, baseStudent: 23.20 },
  "Town Proper-Baliki Aleosan": { distance: 10.36, baseRegular: 31.00, baseStudent: 24.80 },
  "Town Proper-Crossing Bato": { distance: 9.07, baseRegular: 29.00, baseStudent: 23.20 },
  "Town Proper-Crossing Bitoka": { distance: 9.26, baseRegular: 29.00, baseStudent: 23.20 }
};

export const midsayapProper = [
  "Pob 1", "Pob 2", "Pob 3", "Pob 4", 
  "Pob 5", "Pob 6", "Pob 7", "Pob 8",
  "Public Market", "Town Hall"
].sort();

export const outsideMidsayap = [
  "Agriculture (Barrio)", "Agulo", "Aleosan Proper", "Amanon", "Andatuan", "Anonang (Quirino)", 
  "Bagumba", "Balbuena", "Baliki", "Baliki Aleosan", "Barongis Kulambog", "Bitoka", "Boundary", "BPH", 
  "Bridge", "Bual Norte", "Bual Sur", "Bual Sur (Barrios)", "Bugto", "C-Katingawan", "Caingcoy", 
  "Central Bulanan", "Central Glad", "Central Labas", "Compact", "Coop", "Crossing (Ostique)", 
  "Crossing Abaga", "Crossing Arizona", "Crossing Bato", "Crossing Bitoka", "Crossing Bual", 
  "Crossing DPWH/COTELCO", "Crossing Libocean", "Crossing Midsayap", "Crossing NIA", 
  "Crossing Nalin 1", "Crossing Panganod", "Crossing Tanhay", "Crossing Tumbras", "Damatug", 
  "Dela Cruz/NFA/I-LINK", "Dol-Dol", "Double Bridge", "DPWH Office", "Dualing", "Escaguet", 
  "Fatima", "Gallardo Res. To Ontal Res.", "Gayunga", "Glad 1", "Glad 2", "Green Valley", 
  "Ignacio", "Ipil-Ipil", "Kamansi", "Kapinpilan", "Karpa", "Kawayan", "Kimagango", "KM. 49", 
  "Kurbada", "Labas", "Lagumbingan", "Libungan Proper", "Lower Glad", "Madcel", "Malingao", 
  "Malingao (Oting)", "Mampurok", "Mudseng", "Nalin 1 (Barrio)", "Nalin 2 (Barrio)", 
  "Namangkilan", "NES", "Palongoguen", "Panangalang", "Patindeguen", "Planta", "Purok Rojas", 
  "Rangaban", "Rangaban 3", "Sadaan", "Salunayan (Barrio)", "Sambulawan", "San Isidro", 
  "San Pedro", "School", "Silver Homes", "Singit", "Sta. Cruz", "Sta. Cruz (Barrio)", 
  "Tay-Tay Bulanan", "Tawi Tawi", "Toll House", "Tres Rosas", "Tugas", "Upper Kiwanan", 
  "Villarica School"
].sort();

export function normalizeName(name: string): string {
  if (!name) return "";
  const n = name.trim().toLowerCase();
  const properAliases = ["town proper", "midsayap proper", "poblacion", "pob"];
  if (properAliases.some(alias => n.includes(alias))) return "Town Proper";
  return n.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function findRoute(origin: string, destination: string): Route | null {
  const normOrigin = normalizeName(origin);
  const normDest = normalizeName(destination);
  const key = normOrigin === "Town Proper" ? `Town Proper-${normDest}` : `Town Proper-${normOrigin}`;
  return baseRoutes[key] || null;
}