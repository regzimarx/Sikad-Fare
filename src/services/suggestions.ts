// src/services/suggestions.ts
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";

/**
 * Interface for a Suggestion document in Firestore.
 */
export interface Suggestion {
  id: string;
  message: string;
  name?: string; // Optional name of the submitter
  email?: string; // Optional email of the submitter
  timestamp: Timestamp; // Firebase Timestamp
  // Add any other properties your suggestion documents have
}

export async function getSuggestions() {
  const suggestionCol = collection(db, "suggestions");
  // Query to get suggestions, ordered by timestamp in descending order (newest first)
  const q = query(suggestionCol, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Suggestion[];
}

/**
 * Adds a new suggestion entry to the Firestore database.
 * @param suggestionData The suggestion message and any other relevant data.
 */
export async function addSuggestion(suggestionData: Omit<Suggestion, 'id' | 'timestamp'>) {
  const suggestionCol = collection(db, "suggestions");
  // Use serverTimestamp() to automatically get the server's current time
  await addDoc(suggestionCol, { ...suggestionData, timestamp: serverTimestamp() });
}