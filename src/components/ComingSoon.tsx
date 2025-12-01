import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { NavItem } from './BottomNavbar';
import Image from 'next/image';

interface ComingSoonProps {
  featureName: string;
  onNavigate?: (tab: NavItem) => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ featureName, onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full">
        <div className="flex justify-center items-center">
          <Image 
            src="/favicon-1024x1024.svg" 
            alt="Sikad Logo" 
            width={128} 
            height={128}
            className="blur-[0.25px]"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Coming Soon!
        </h1>

        <p className="text-gray-600 mb-6">
          The <span className="font-semibold text-blue-600">{featureName}</span> tab is under construction.
        </p>

        <p className="text-sm text-gray-500">
          We're working hard to bring you this feature. We appreciate your patience and can't wait to show you what's new.
        </p>

        {onNavigate && (
          <>
            <div className="border-t border-gray-200 my-6"></div>
            <p className="text-sm text-gray-600 mb-4">
              Have ideas for this feature or others? Let us know!
            </p>
            <button
              onClick={() => onNavigate('suggest')}
              className="w-full bg-yellow-400 text-yellow-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all duration-200 active:scale-95"
            >
              <FaLightbulb /> Go to Suggestion Page
            </button>
          </>
        )}
      </div>
    </div>
  );
};


export default ComingSoon;
