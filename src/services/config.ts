import { db } from "../lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";

/**
 * Interface for the App Configuration document in Firestore.
 */
export interface AppConfig {
  currentVersion: string;
  lastUpdated: Timestamp;
  notice: string;
}

/**
 * Fetches the application configuration from the 'config/appInfo' document in Firestore.
 * @returns The app configuration object, or null if it doesn't exist.
 */
export async function getAppConfig(): Promise<AppConfig | null> {
  const configRef = doc(db, "config", "appInfo");
  const docSnap = await getDoc(configRef);

  return docSnap.exists() ? (docSnap.data() as AppConfig) : null;
}