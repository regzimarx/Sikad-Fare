// src/services/reports.ts
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { FormData as ReportFormData } from "../hooks/useReportForm";

/**
 * Adds a new report entry to the Firestore database.
 * @param reportData The form data for the report.
 */
export async function addReport(reportData: ReportFormData) {
  const reportCol = collection(db, "reports");
  // Use serverTimestamp() to automatically get the server's current time
  // We are also adding a submissionTimestamp to distinguish from the dateTime of the incident
  await addDoc(reportCol, { 
    ...reportData, 
    submissionTimestamp: serverTimestamp() 
  });
}