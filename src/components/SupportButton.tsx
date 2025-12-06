
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import { logSupportButtonClick } from '../services/analytics';
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
  const [animationState, setAnimationState] = useState<'peeking' | 'open' | 'hidden'>('hidden');
  const [isTeleporting, setIsTeleporting] = useState(false); // New state to control silent transfer

  // Use useRef to hold timers so they can be cleared reliably
  const timerRef = useRef<NodeJS.Timeout[]>([]);

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
    peeking: isRightSide ? 'translate-x-[calc(100%-56px)]' : '-translate-x-[calc(100%-56px)]',
    open: 'translate-x-0',
    // When hidden, it slides off-screen, but during teleport, it will be opacity-0
    hidden: isRightSide ? 'translate-x-[105%]' : '-translate-x-[105%]', 
  }[animationState];

  return (
    <Link
      href="https://www.buymeacoffee.com/mattykun"
      target="_blank"
      rel="noopener noreferrer"
      onClick={logSupportButtonClick}
      style={{ top: currentPosition.top, bottom: currentPosition.bottom, left: currentPosition.left, right: currentPosition.right }}
      className={`
        group fixed z-50
        flex items-center
        bg-bmc-yellow text-black font-poppins font-medium
        h-14 pl-4 pr-5 py-2 shadow-lg
        ${isTeleporting ? 'transition-none opacity-0' : 'transition-transform duration-700 ease-in-out opacity-100'}
        ${isRightSide ? 'rounded-l-full' : 'rounded-r-full'}
        ${transformClass}
      `}
    >
      {isRightSide ? <><span className="text-2xl mr-2 font-inter">🙏🏻</span><span className="text-sm whitespace-nowrap font-inter">Support Us</span></> :
                     <><span className="text-sm whitespace-nowrap font-inter">Support Us</span><span className="text-2xl ml-2 font-inter">🙏🏻</span></>
      }
    </Link>
  );
};

export default SupportButton;