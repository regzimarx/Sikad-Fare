'use client';

import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface SuggestionFormData {
  message: string;
  name?: string;
  email?: string;
}

interface SuggestionFormProps {
  onSubmit: (data: SuggestionFormData) => Promise<void>;
}

export default function SuggestionForm({ onSubmit }: SuggestionFormProps) {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      // You can add a toast notification here if you like
      return;
    }

    setIsSubmitting(true);
    await onSubmit({ message, name, email });
    setIsSubmitting(false);

    // Clear the form after successful submission
    setMessage('');
    setName('');
    setEmail('');
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 p-4">
      <div>
        <label htmlFor="suggestion-message" className="block text-sm font-medium text-gray-700">
          Your Suggestion*
        </label>
        <textarea
          id="suggestion-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm text-gray-500"
          placeholder="I think it would be great if..."
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="suggestion-name" className="block text-sm font-medium text-gray-700">
            Name (Optional)
          </label>
          <input type="text" id="suggestion-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" />
        </div>
        <div>
          <label htmlFor="suggestion-email" className="block text-sm font-medium text-gray-700">
            Email (Optional)
          </label>
          <input type="email" id="suggestion-email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm" />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting || !message.trim()} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-300 disabled:cursor-not-allowed">
        {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Send Suggestion'}
      </button>
    </form>
  );
}