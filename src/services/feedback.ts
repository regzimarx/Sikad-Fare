// src/services/feedback.ts
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";

/**
 * Interface for a Feedback document in Firestore.
 */
export interface Feedback {
  id: string;
  message: string;
  name?: string; // Optional name of the submitter
  email?: string; // Optional email of the submitter
  timestamp: Timestamp; // Firebase Timestamp
  // Add any other properties your feedback documents have
}

export async function getFeedbacks() {
  const feedbackCol = collection(db, "feedbacks");
  // Query to get feedbacks, ordered by timestamp in descending order (newest first)
  const q = query(feedbackCol, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
}

/**
 * Adds a new feedback entry to the Firestore database.
 * @param feedbackData The feedback message and any other relevant data.
 */
export async function addFeedback(feedbackData: Omit<Feedback, 'id' | 'timestamp'>) {
  const feedbackCol = collection(db, "feedbacks");
  // Use serverTimestamp() to automatically get the server's current time
  await addDoc(feedbackCol, { ...feedbackData, timestamp: serverTimestamp() });
}