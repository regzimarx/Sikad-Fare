'use client';

import React from 'react';
import toast from 'react-hot-toast';
import SuggestionForm from '../../components/suggestions/SuggestionForm'; // Assuming this file exists
import { addSuggestion } from '../../services/suggestions';

interface SuggestionData {
  message: string;
  name?: string;
  email?: string;
}

export default function SuggestionsPage() {

  const handleSuggestionSubmit = async (data: SuggestionData) => {
    const loadingToast = toast.loading('Sending your suggestion...');

    try {
      await addSuggestion(data);
      toast.dismiss(loadingToast);
      toast.success('Thank you! Your suggestion has been received.');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Something went wrong. Please try again.');
      console.error("Error submitting suggestion:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-900">Suggestion Box</h1>
      <p className="mt-2 text-center text-sm text-gray-600">Have an idea to improve the app? We'd love to hear it!</p>
      <div className="mt-8">
        <SuggestionForm onSubmit={handleSuggestionSubmit} />
      </div>
    </div>
  );
}