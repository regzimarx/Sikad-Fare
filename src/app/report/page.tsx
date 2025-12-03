'use client';

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useReportForm } from '../../hooks/useReportForm';
import { StepRenderer } from '../../components/StepRenderer';


export default function ReportPage() {
  const {
    step,
    setStep,
    formData,
    setFormData,
    isSubmitting,
    availableDestinations,
    handleNext,
    handleBack,
    handleSubmit,
    resetForm,
  } = useReportForm();

  // The openLocationPicker function and related state are no longer needed
  // as LocationSelector will handle the dropdown directly.
  return (
    <main className={`flex flex-col items-center h-screen bg-gray-50 p-4 pb-32 overflow-y-auto transition-all duration-300 ${
      (step === 1 || step === 3) ? 'justify-center' : 'justify-start'
    }`}>
      <Toaster position="top-center" reverseOrder={false} />
      <div className={`w-full max-w-md p-6 space-y-4 bg-white rounded-xl shadow-2xl mt-4 ${step === 2 ? 'pb-12' : ''}`}>

        <h1 className="text-3xl font-bold text-center text-gray-800">Report an Issue</h1>
        
        {/* Progress Indicator */}
        {step < 6 && (
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
                <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(step / 5) * 100}%` }}
                ></div>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <StepRenderer
            step={step}
            formData={formData}
            setFormData={setFormData}
            availableDestinations={availableDestinations}
          />

          {/* Navigation Buttons */}
          <div className={`flex items-center mt-8 ${step > 1 && step < 6 ? 'justify-between' : 'justify-end'}`}>
            
            {/* Back Button (Hidden on Step 1, 2, and 6) */}
            {(step > 1 && step < 6) && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="px-5 py-2.5 text-base font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}

            {/* Next Button (Only on Step 1, 2, 3 and 4) */}
            {(step >= 1 && step <= 4) && (
              <button 
                type="button" 
                onClick={handleNext} 
                className={`px-6 py-2.5 text-base font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400`}
              >
                Next
              </button>
            )}

            {/* Submit Button (Only on Step 5) */}
            {step === 5 && (
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="px-6 py-2.5 text-base font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}

            {/* Restart Button (Only on Step 6) */}
            {step === 6 && (
                <button 
                    type="button" 
                    onClick={resetForm} 
                    className="w-full px-6 py-3 text-xl font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors justify-center"
                >
                    Start New Report
                </button>
            )}

          </div>
        </form>
      </div>

    </main>
  );
}