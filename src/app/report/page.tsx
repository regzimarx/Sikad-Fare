'use client';

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaCheckCircle } from 'react-icons/fa';
import { midsayapProper, outsideMidsayap } from '../../lib/routeData';

const issueTypes = [
  'Overcharging',
  'Refused Passenger',
  'Dangerous Driving',
  'Rude Behavior',
  'Passenger Misconduct',
  'Lost Item',
  'Accident',
  'Other Incident',
];

const reporterTypes = ['Passenger', 'Driver', 'Resident', 'Other'];

// Combine and sort all locations for the dropdown
const allLocations = [...midsayapProper, ...outsideMidsayap].sort();

export default function ReportPage() {
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({
    issueType: [] as string[],
    reporterType: '',
    sikadNumber: '',
    locationFrom: '',
    locationTo: '',
    locationLandmark: '',
    description: '',
    dateTime: '', 
    photoUrl: '', 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);

  // --- State for the custom location picker ---
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'locationFrom' | 'locationTo' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Auto-fill date and time when the component mounts
    setFormData((prev) => ({ ...prev, dateTime: new Date().toLocaleString() }));
  }, []);

  useEffect(() => {
    // --- Logic for available destinations based on origin ---
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

      // Clear destination if it's no longer valid
      if (!destinations.includes(formData.locationTo)) {
        setFormData(prev => ({ ...prev, locationTo: '' }));
      }
    } else {
      // If origin is cleared, clear destinations too
      setAvailableDestinations([]);
    }
  }, [formData.locationFrom]);

  const handleNext = () => {
    if (step === 2 && formData.issueType.length === 0) {
      toast.error('Please select at least one issue type.');
      return;
    }

    // --- Validation Checks ---
    if (step === 4 && !formData.locationLandmark.trim() && !(formData.locationFrom.trim() && formData.locationTo.trim())) {
      toast.error('Please provide the origin, destination, OR a landmark location.');
      return;
    }

    // --- Proceed to Next Step ---
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
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(6);
    }, 1500);
  };

  // Utility component for Step 1 (Reporter Type) and Step 2 (Issue Type)
  // Class `w-full` is omitted here so the parent can control the width (grid or full-width column)
  const BigButton = ({ label, onClick, isSelected }: { label: string; onClick: () => void; isSelected: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 text-base text-center font-semibold rounded-xl border-2 transition-all h-full ${
        isSelected 
          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
          : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  // A more compact button for multi-select grids like in Step 2
  const CompactButton = ({ label, onClick, isSelected }: { label: string; onClick: () => void; isSelected: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 text-sm text-center font-semibold rounded-lg border-2 transition-all h-full ${
        isSelected 
          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
          : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 1: // Who are you? (Single Column)
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Step 1: Who are you?</h2>
            {/* Wrapper div ensures single column, full width layout */}
            <div className="flex flex-col space-y-3"> 
              {reporterTypes.map((reporter) => (
                <BigButton
                  key={reporter}
                  label={reporter}
                  isSelected={formData.reporterType === reporter}
                  onClick={() => {
                    setFormData({ ...formData, reporterType: reporter });
                    setStep(2); // Auto-advance
                  }}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
                Select your role in this incident.
            </p>
          </div>
        );
      case 2: // What happened? (Two-Column Grid)
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Step 2: What happened?</h2>
            <div className="grid grid-cols-2 gap-3"> {/* This is the 2-column grid */}
              {issueTypes.map((issue) => (
                <CompactButton
                  key={issue}
                  label={issue}
                  isSelected={formData.issueType.includes(issue)}
                  onClick={() => {
                    const newIssueTypes = formData.issueType.includes(issue)
                      ? formData.issueType.filter((i) => i !== issue) // Remove issue
                      : [...formData.issueType, issue]; // Add issue
                    setFormData({ ...formData, issueType: newIssueTypes });
                  }}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
                You can select more than one.
            </p>
          </div>
        );
      case 3: // Sikad Number (Single Column)
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Step 3: Sikad Number?</h2>
            <p className="text-sm text-gray-600 mb-2">
              If you know the **Sikad/Tricycle Plate Number**, please enter it.
            </p>
            <label htmlFor="sikadNumber" className="block text-lg font-medium text-gray-700 sr-only">
              Sikad Number or Description
            </label>
            <input
              type="text"
              id="sikadNumber"
              value={formData.sikadNumber}
              onChange={(e) => setFormData({ ...formData, sikadNumber: e.target.value })}
              placeholder='Enter number or "Not sure"'
              className="w-full p-4 text-xl mt-1 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
                It's okay if you don't know the exact number!
            </p>
          </div>
        );
      case 4: // Where did it happen? (Single Column)
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">Step 4: Where did it happen?</h2>
            
            <p className="text-md font-semibold text-gray-800 mb-2">Trip Route</p>
            <label htmlFor="locationFrom" className="block text-lg font-medium text-gray-700 sr-only">
              From
            </label>
            <button
              type="button"
              id="locationFrom"
              onClick={() => { setPickerTarget('locationFrom'); setIsPickerOpen(true); }}
              className="w-full p-3 mt-1 mb-3 text-left border-2 border-gray-300 rounded-lg focus:border-blue-500 bg-white"
            >
              {formData.locationFrom || <span className="text-gray-400">Select Origin</span>}
            </button>

            <label htmlFor="locationTo" className="block text-lg font-medium text-gray-700 sr-only">
              To
            </label>
            <button
              type="button"
              id="locationTo"
              onClick={() => { setPickerTarget('locationTo'); setIsPickerOpen(true); }}
              disabled={!formData.locationFrom}
              className="w-full p-3 mt-1 mb-4 text-left border-2 border-gray-300 rounded-lg focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {formData.locationTo || <span className="text-gray-400">Select Destination</span>}
            </button>
            
            <div className="text-center my-4 font-bold text-gray-500">
                OR
            </div>
            
            <p className="text-md font-semibold text-gray-800 mb-2">Landmark Location</p>
            <label htmlFor="locationLandmark" className="block text-lg font-medium text-gray-700 sr-only">
              Landmark-based Location
            </label>
            <input 
              type="text" 
              id="locationLandmark" 
              value={formData.locationLandmark} 
              onChange={(e) => setFormData({ ...formData, locationLandmark: e.target.value })} 
              placeholder="e.g., Near the public market corner" 
              className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg focus:border-blue-500" 
            />
          </div>
        );
      case 5: // Describe (Single Column)
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Step 5: Describe what happened</h2>
            <textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows={5} 
              className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg focus:border-blue-500" 
              placeholder="Please provide details (e.g., time, color of sikad, what was said/done). This is important."
            ></textarea>
            
            <p className="mt-4 text-sm text-gray-600">
              <strong>Date & Time of Incident:</strong> {formData.dateTime} 
            </p>
            <p className="text-sm text-gray-600">
              *The current date/time is auto-filled but you can describe if it happened on a different day.
            </p>
          </div>
        );
      case 6: // Success
        return (
          <div className="text-center py-10">
            <FaCheckCircle className="text-green-500 w-24 h-24 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Salamat!</h2>
            <p className="text-xl text-green-600 font-semibold">
              Your report has been recorded.
            </p>
            <p className="text-md text-gray-600 mt-4">
              We appreciate you taking the time to report this. Your information helps us maintain safety and fairness.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 pb-20"> 
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
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className={`flex items-center mt-8 ${step > 1 && step < 6 ? 'justify-between' : 'justify-center'}`}>
            
            {/* Back Button (Hidden on Step 1, 2, and 6) */}
            {(step == 2 ||step === 3 || step === 4 || step == 5) && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="px-5 py-2.5 text-base font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            )}

            {/* Next Button (Only on Step 2, 3 and 4) */}
            {(step === 2 || step === 3 || step === 4) && (
              <button 
                type="button" 
                onClick={handleNext} 
                className={`px-6 py-2.5 text-base font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors ml-auto`}
              >
                Next
              </button>
            )}

            {/* Submit Button (Only on Step 5) */}
            {step === 5 && (
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full px-6 py-3 text-xl font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            )}

            {/* Restart Button (Only on Step 6) */}
            {step === 6 && (
                <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="w-full px-6 py-3 text-xl font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
                >
                    Start New Report
                </button>
            )}

          </div>
        </form>
      </div>

      {/* --- Location Picker Slide-Up Panel --- */}
      {isPickerOpen && (
        <div
          onClick={() => setIsPickerOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl p-4 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isPickerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-center mb-3">
          {pickerTarget === 'locationFrom' ? 'Select Origin' : 'Select Destination'}
        </h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a location..."
          className="w-full p-3 mb-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
        />
        <div className="max-h-[45vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-4">
              {/* Inside Town Column */}
              <div>
                <h4 className="font-bold text-gray-600 mb-2 sticky top-0 bg-gray-50 py-1">Inside Town</h4>
                {(pickerTarget === 'locationFrom' ? midsayapProper : availableDestinations.filter(loc => midsayapProper.includes(loc)))
                  .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(location => (
                    <button
                      key={location}
                      onClick={() => {
                        if (pickerTarget) { setFormData({ ...formData, [pickerTarget]: location }); }
                        setIsPickerOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full text-left p-2 text-base rounded-lg hover:bg-gray-200"
                    >
                      {location}
                    </button>
                  ))}
              </div>
              {/* Outside Town Column */}
              <div>
                <h4 className="font-bold text-gray-600 mb-2 sticky top-0 bg-gray-50 py-1">Outside Town</h4>
                {(pickerTarget === 'locationFrom' ? outsideMidsayap : availableDestinations.filter(loc => outsideMidsayap.includes(loc)))
                  .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(location => (
                    <button
                      key={location}
                      onClick={() => {
                        if (pickerTarget) { setFormData({ ...formData, [pickerTarget]: location }); }
                        setIsPickerOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full text-left p-2 text-base rounded-lg hover:bg-gray-200"
                    >
                      {location}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        <button
          onClick={() => {
            setIsPickerOpen(false);
            setSearchTerm('');
          }}
          className="w-full mt-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}