'use client';

import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { FormData } from '../hooks/useReportForm';
import {
  primaryDriverIssues,
  primaryPassengerIssues,
  secondaryDriverIssues,
  secondaryPassengerIssues,
  miscIssueText,
  reporterTypes,
} from '../lib/issueData'; 
import { midsayapProper, outsideMidsayap } from '../lib/routeData';
import LocationSelector from './form/LocationSelector'; 

interface StepRendererProps {
  step: number;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  availableDestinations: string[];
}

// Reusable button components
const BigButton = ({ label, onClick, isSelected }: { label: string; onClick: () => void; isSelected: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 text-base text-center font-semibold rounded-xl border-2 transition-all h-full ${
      isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
    }`}
  >
    {label}
  </button>
);

const CompactButton = ({ label, onClick, isSelected }: { label: string; onClick: () => void; isSelected: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2.5 text-sm text-center font-semibold rounded-lg border-2 transition-all h-full ${
      isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
    }`}
  >
    {label}
  </button>
);

export function StepRenderer({ step, formData, setFormData, availableDestinations }: StepRendererProps) {
  // Get the base issues depending on the reporter type
  const baseIssues =
    formData.reporterType === 'Driver'
      ? [...primaryDriverIssues, ...secondaryDriverIssues]
      : [...primaryPassengerIssues, ...secondaryPassengerIssues];

  // Sort the base issues alphabetically, then add the "Miscellaneous" option at the end.
  baseIssues.sort((a, b) => a.localeCompare(b));
  const allIssues = [...baseIssues, miscIssueText];

  const handleIssueToggle = (issue: string) => {
    // If "Miscellaneous / Other" is selected, ensure miscIssueDescription is cleared if unselected
    if (issue === miscIssueText && formData.issueType.includes(miscIssueText)) {
      setFormData({
        ...formData,
        issueType: formData.issueType.filter((i) => i !== issue),
        miscIssueDescription: '', // Clear description when unselecting
      });
      return;
    }

    // If "Miscellaneous / Other" is being selected, ensure miscIssueDescription is not cleared
    if (issue === miscIssueText && !formData.issueType.includes(miscIssueText)) {
      setFormData({ ...formData, issueType: [...formData.issueType, issue] });
      return;
    }

    const newIssues = formData.issueType.includes(issue)
      ? formData.issueType.filter((i) => i !== issue)
      : [...formData.issueType, issue];
    setFormData({ ...formData, issueType: newIssues });
  };

  switch (step) {
    case 1: // Who are you?
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center">Step 1: Who are you?</h2>
          <div className="flex flex-col space-y-3">
            {reporterTypes.map((reporter) => (
              <BigButton
                key={reporter}
                label={reporter}
                isSelected={formData.reporterType === reporter}
                onClick={() => setFormData({ ...formData, reporterType: reporter, issueType: [], miscIssueDescription: '' })}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">Select your role in this incident.</p>
        </div>
      );
    case 2: // What happened?
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Step 2: What happened?</h2>
          <div className="grid grid-cols-2 gap-3">
            {allIssues.map((issue) => (
              <CompactButton
                key={issue}
                label={issue}
                isSelected={formData.issueType.includes(issue)}
                onClick={() => handleIssueToggle(issue)}
              />
            ))}
          </div>

          {formData.issueType.includes(miscIssueText) && (
            <div className="mt-4 animate-fade-in">
              <textarea
                id="miscIssueDescription"
                value={formData.miscIssueDescription}
                onChange={(e) => setFormData({ ...formData, miscIssueDescription: e.target.value })}
                rows={3}
                className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Optionally describe the issue..."
              ></textarea>
            </div>
          )}
          <p className="mt-4 text-sm text-gray-500 text-center">You can select more than one.</p>
        </div>
      );
    case 3: // Sikad Number
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Step 3: Sikad Number?</h2>
          <p className="text-sm text-gray-600 mb-2">
            If you know the <span className="font-semibold">Sikad Tracking Number</span> or the <span className="font-semibold">Plate Number</span>, please enter it.
          </p>
          <label htmlFor="sikadNumber" className="block text-lg font-medium text-gray-700 sr-only">
            Sikad Number or Description
          </label>
          <input
            type="text"
            id="sikadNumber"
            value={formData.sikadNumber}
            onChange={(e) => setFormData({ ...formData, sikadNumber: e.target.value })}
            placeholder='Enter number or "I don&apos;t know"'
            className="w-full p-4 text-xl mt-1 border-2 border-gray-300 rounded-lg focus:border-blue-500 placeholder:text-gray-400"
          />
          <p className="mt-2 text-sm text-gray-500">It's okay if you don't know the exact number!</p>
        </div>
      );
    case 4: // Where did it happen?
      return (
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Step 4: Where did it happen?</h2>
          <p className="text-md font-semibold text-gray-800 mb-2">Trip Route</p>
          <LocationSelector
            label="From"
            icon="📍"
            value={formData.locationFrom}
            onChange={(value) => setFormData({ ...formData, locationFrom: value, locationTo: '' })} // Clear destination if origin changes
            options={[...midsayapProper, ...outsideMidsayap]}
            placeholder="Select starting point..."
          />

          <div className="mb-4">
            <LocationSelector
              label="To"
              icon="🎯"
              value={formData.locationTo}
              onChange={(value) => setFormData({ ...formData, locationTo: value })}
              options={availableDestinations}
              placeholder="Select destination..."
              disabled={!formData.locationFrom}
            />
          </div>

          <div className="text-center my-4 font-bold text-gray-500">OR</div>

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
            className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg focus:border-blue-500 placeholder:text-gray-400"
          />
        </div>
      );
    case 5: // Describe
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center">Step 5: Describe what happened</h2>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full p-3 mt-1 border-2 border-gray-300 rounded-lg focus:border-blue-500 placeholder:text-gray-400"
            placeholder="Please provide details (e.g., time, color of sikad, what was said/done)."
          ></textarea>
          <p className="mt-4 text-sm text-gray-600">
            <strong>Date & Time of Incident:</strong> {formData.dateTime}
          </p>
          <p className="text-sm text-gray-600">*The current date/time is auto-filled but you can describe if it happened on a different day.</p>
        </div>
      );
    case 6: // Success
      return (
        <div className="text-center py-10">
          <FaCheckCircle className="text-green-500 w-24 h-24 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Salamat!</h2>
          <p className="text-xl text-green-600 font-semibold">Your report has been recorded.</p>
          <p className="text-md text-gray-600 mt-4">
            We appreciate you taking the time to report this. Your information helps us maintain safety and fairness.
          </p>
        </div>
      );
    default:
      return null;
  }
}