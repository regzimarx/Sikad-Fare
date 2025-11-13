
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface Fare {
  id: string;
  origin: string;
  destination: string;
  price: number;
}

export async function getFares(origin?: string, destination?: string) {
  const faresCol = collection(db, "fares");
  const q = origin && destination
    ? query(faresCol, where("origin", "==", origin), where("destination", "==", destination))
    : faresCol;

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Fare, 'id'>) }));
}
