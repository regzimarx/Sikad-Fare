
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import { logSupportButtonClick, logSupportButtonDismissed } from '../services/analytics';
type Position = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  side: 'left' | 'right';
};

const positions: Position[] = [
  { top: '20%', right: '0', side: 'right' },
  { bottom: '20%', right: '0', side: 'right' },
  { bottom: '20%', left: '0', side: 'left' },
  { top: '20%', left: '0', side: 'left' },
];

const SupportButton = () => {
  const [positionIndex, setPositionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false); // Start as hidden, let useEffect decide
  const [animationState, setAnimationState] = useState<'peeking' | 'open' | 'hidden'>('hidden');
  const [isTeleporting, setIsTeleporting] = useState(false); // New state to control silent transfer

  // Use useRef to hold timers so they can be cleared reliably
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  // Check session storage on mount to see if the button was already dismissed
  useEffect(() => {
    if (sessionStorage.getItem('supportButtonDismissed') !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link from navigating
    e.stopPropagation(); // Stop the event from bubbling to the Link's onClick
    sessionStorage.setItem('supportButtonDismissed', 'true');
    setIsVisible(false);
    logSupportButtonDismissed(); // Log the dismiss event
  };
  useEffect(() => {
    const runAnimationCycle = () => {
      // Clear any existing timers before starting a new cycle
      timerRef.current.forEach(clearTimeout);
      timerRef.current = [];

      // 1. Appear in 'peeking' state (after teleport)
      timerRef.current.push(setTimeout(() => {
        setIsTeleporting(false); // Make visible and enable transitions
        setAnimationState('peeking');
      }, 50)); // Small delay to ensure position update is rendered before transition

      // 2. Open fully
      timerRef.current.push(setTimeout(() => setAnimationState('open'), 2000)); // Slower to open

      // 3. Close back to 'peeking'
      timerRef.current.push(setTimeout(() => setAnimationState('peeking'), 4500));

      // 4. Hide completely (slide off-screen)
      timerRef.current.push(setTimeout(() => setAnimationState('hidden'), 8500));

      // 5. Initiate teleport: make invisible, change position, then restart cycle
      timerRef.current.push(setTimeout(() => {
        setIsTeleporting(true); // Make invisible and disable transitions for teleport
        setPositionIndex(prevIndex => (prevIndex + 1) % positions.length);
        // The effect will re-run due to positionIndex change, starting a new cycle
      }, 34000)); // Increased delay: it now waits 3.5s after hiding before teleporting
    };

    runAnimationCycle(); // Start the first cycle

    // Cleanup function
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [positionIndex]); // This effect re-runs every time the button teleports

  const currentPosition = positions[positionIndex];
  const isRightSide = currentPosition.side === 'right';

  // Determine dynamic classes for positioning and animation
  const transformClass = {
    peeking: isRightSide ? 'translate-x-[calc(100%-100px)]' : '-translate-x-[calc(100%-100px)]',
    open: 'translate-x-0',
    // When hidden, it slides off-screen, but during teleport, it will be opacity-0
    hidden: isRightSide ? 'translate-x-[105%]' : '-translate-x-[105%]', 
  }[animationState];

  if (!isVisible) return null;

  return (
    <div
      style={{ top: currentPosition.top, bottom: currentPosition.bottom, left: currentPosition.left, right: currentPosition.right }}
      className={`
        fixed z-50 flex items-center
        ${isTeleporting ? 'transition-none opacity-0' : 'transition-transform duration-700 ease-in-out opacity-100'}
        ${transformClass}
      `}
    >
      {isRightSide ? (
        <>
          <button onClick={handleDismiss} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md mr-1 text-gray-500 hover:bg-gray-200" aria-label="Dismiss support button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <Link href="https://www.buymeacoffee.com/mattykun" target="_blank" rel="noopener noreferrer" onClick={logSupportButtonClick} className="flex items-center bg-bmc-yellow text-black font-poppins font-medium h-14 pl-4 pr-5 py-2 shadow-lg rounded-l-full">
            <span className="text-2xl mr-2 font-inter transition-transform duration-300 group-hover:scale-110">🙏🏻</span>
            <span className={`text-sm whitespace-nowrap font-inter transition-opacity duration-300 ${animationState === 'open' ? 'opacity-100' : 'opacity-0'}`}>Support Us</span>
          </Link>
        </>
      ) : (
        <>
          <Link href="https://www.buymeacoffee.com/mattykun" target="_blank" rel="noopener noreferrer" onClick={logSupportButtonClick} className="flex items-center bg-bmc-yellow text-black font-poppins font-medium h-14 pl-5 pr-4 py-2 shadow-lg rounded-r-full">
            <span className={`text-sm whitespace-nowrap font-inter transition-opacity duration-300 ${animationState === 'open' ? 'opacity-100' : 'opacity-0'}`}>Support Us</span>
            <span className="text-2xl ml-2 font-inter transition-transform duration-300 group-hover:scale-110">🙏🏻</span>
          </Link>
          <button onClick={handleDismiss} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md ml-1 text-gray-500 hover:bg-gray-200" aria-label="Dismiss support button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </>
      )}
    </div>
  );
};

export default SupportButton;