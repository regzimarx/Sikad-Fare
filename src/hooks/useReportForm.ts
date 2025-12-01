'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { midsayapProper, outsideMidsayap } from '../lib/routeData';
import { secondaryPassengerIssues, secondaryDriverIssues, miscIssueText } from '../lib/issueData';

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
  const [isOtherIssuesVisible, setIsOtherIssuesVisible] = useState(false);

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

  useEffect(() => {
    const isOtherSelected = formData.issueType.some(issue => secondaryPassengerIssues.includes(issue) || secondaryDriverIssues.includes(issue) || issue === miscIssueText);
    setIsOtherIssuesVisible(isOtherSelected);
  }, [formData.issueType]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error('Please describe what happened.');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Submitting report:', formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(6); // Go to success step
    }, 1500);
  };

  const resetForm = () => {
    setStep(1);
    setFormData(initialFormData);
  }

  return { step, setStep, formData, setFormData, isSubmitting, availableDestinations, isOtherIssuesVisible, setIsOtherIssuesVisible, handleNext, handleBack, handleSubmit, resetForm };
}