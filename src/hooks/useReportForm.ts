'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { midsayapProper, outsideMidsayap } from '../lib/routeData';
import { miscIssueText } from '../lib/issueData';
import { addReport } from '../services/reports';

export type FormData = {
  issueType: string[];
  reporterType: string;
  sikadNumber: string;
  locationFrom: string;
  locationTo: string;
  locationLandmark: string;
  description: string;
  miscIssueDescription: string;
  dateTime: string;
  photoUrl: string;
};

const initialFormData: FormData = {
  issueType: [],
  reporterType: '',
  sikadNumber: '',
  locationFrom: '',
  locationTo: '',
  locationLandmark: '',
  description: '',
  miscIssueDescription: '',
  dateTime: '',
  photoUrl: '',
};

export function useReportForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);

  useEffect(() => {
    // Auto-fill date and time when the hook is first used
    setFormData((prev) => ({ ...prev, dateTime: new Date().toLocaleString() }));
  }, []);

  useEffect(() => {
    if (formData.locationFrom) {
      const isOriginProper = midsayapProper.includes(formData.locationFrom);
      const isOriginOutside = outsideMidsayap.includes(formData.locationFrom);
      let destinations: string[] = [];

      if (isOriginOutside) {
        destinations = [...midsayapProper];
      } else if (isOriginProper) {
        destinations = [
          ...midsayapProper.filter(place => place !== formData.locationFrom),
          ...outsideMidsayap,
        ];
      }
      setAvailableDestinations(destinations.sort());

      if (!destinations.includes(formData.locationTo)) {
        setFormData(prev => ({ ...prev, locationTo: '' }));
      }
    } else {
      setAvailableDestinations([]);
    }
  }, [formData.locationFrom, formData.locationTo]);

  const handleNext = () => {
    if (step === 2 && formData.issueType.length === 0) {
      toast.error('Please select at least one issue type.');
      return;
    }
    if (step === 4 && !formData.locationLandmark.trim() && !(formData.locationFrom.trim() && formData.locationTo.trim())) {
      toast.error('Please provide the origin, destination, OR a landmark location.');
      return;
    }
    if (step === 2 && formData.issueType.includes(miscIssueText) && !formData.miscIssueDescription.trim()) {
      toast.error('Please describe the "Miscellaneous Issue".');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error('Please describe what happened.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReport(formData);
      toast.success('Report submitted successfully!');
      setStep(6); // Go to success step
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData(initialFormData);
  }

  return { step, setStep, formData, setFormData, isSubmitting, availableDestinations, handleNext, handleBack, handleSubmit, resetForm };
}