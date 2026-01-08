'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function PwaInstallPrompt() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleBeforeInstallPrompt = (e: any) => {
      console.log('📱 PWA Install Prompt event fired!'); // Check your console for this

      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Show the custom install toast
      toast(
        (t) => (
          <div className="flex items-center gap-4 min-w-[250px]">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Install App</p>
              <p className="text-xs text-gray-500">Add to home screen for easier access</p>
            </div>
            <button
              onClick={() => {
                // Trigger the browser's install prompt
                e.prompt();
                // Wait for the user to respond to the prompt
                e.userChoice.then((choiceResult: any) => {
                  if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                  }
                  toast.dismiss(t.id);
                });
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm hover:bg-blue-500 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>
        ),
        {
          duration: 15000, // Show for 15 seconds
          position: 'top-center',
          id: 'pwa-install-prompt', // Prevent duplicates
        }
      );
    };

    // Check if already in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App is already installed');
      return;
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMounted]);

  return null;
}