'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface DropdownOptgroup {
  label: string;
  options: DropdownOption[];
}

interface DropdownProps {
  label: string;
  icon?: ReactNode;
  value: string | number;
  onChange: (value: string) => void;
  options: (DropdownOption | DropdownOptgroup)[];
  placeholder?: string;
  disabled?: boolean;
  disableSort?: boolean;
  tooltip?: ReactNode;
  searchable?: boolean;
}

export default function Dropdown({
  label,
  icon,
  value,
  onChange,
  options = [], 
  placeholder,
  disabled = false,
  disableSort = false,
  tooltip,
  searchable,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState<number | undefined>(undefined);

  const getSelectedLabel = () => {
    // We can safely iterate over options now since it defaults to []
    for (const opt of options) {
      if ('options' in opt) {
        const found = opt.options.find(o => o.value === value);
        if (found) return found.label;
      } else if (opt.value === value) {
        return opt.label;
      }
    }
    return placeholder || 'Select...';
  };

  // Sort options alphabetically unless disabled
  const sortedOptions = disableSort ? options : options
    .map(opt => {
      if ('options' in opt) {
        return {
          ...opt,
          options: [...opt.options].sort((a, b) => a.label.localeCompare(b.label))
        };
      }
      return opt;
    })
    .sort((a, b) => {
      const labelA = 'options' in a ? a.label : a.label;
      const labelB = 'options' in b ? b.label : b.label;
      return labelA.localeCompare(labelB);
    });

  // Determine if search should be visible (default to true if > 10 options)
  const shouldShowSearch = searchable ?? options.reduce((acc, opt) => {
    if ('options' in opt) return acc + opt.options.length;
    return acc + 1;
  }, 0) > 10;

  const filteredOptions = searchQuery
    ? sortedOptions
        .map((opt) => {
          if ('options' in opt) {
            const filteredSub = opt.options.filter((o) =>
              o.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredSub.length > 0) {
              return { ...opt, options: filteredSub };
            }
            return null;
          }
          return opt.label.toLowerCase().includes(searchQuery.toLowerCase())
            ? opt
            : null;
        })
        .filter(Boolean) as (DropdownOption | DropdownOptgroup)[]
    : sortedOptions;

  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 400); // Match animation duration
  };

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (isOpen) {
      e.stopPropagation(); 
      closeDropdown();
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && isOpen) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Reset search when closed
      const timer = setTimeout(() => setSearchQuery(''), 400);
      return () => clearTimeout(timer);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]); 

  useEffect(() => {
    if (listRef.current) {
      const height = listRef.current.scrollHeight;
      const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.6 : 600;
      setListHeight(Math.min(height, maxHeight));
    }
  }, [filteredOptions, searchQuery, isOpen]);

  const handleSelect = (optValue: string | number) => {
    onChange(String(optValue));
    closeDropdown();
  };

  return (
    <div className="group" ref={dropdownRef}>
      <label className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5 transition-colors group-focus-within:text-gray-900">
        {icon && <span className="text-sm opacity-70">{icon}</span>}
        {label}
        {tooltip && <span className="ml-auto">{tooltip}</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full px-4 py-3 text-sm font-medium border border-gray-200 rounded-lg bg-white text-left flex items-center justify-between transition-all duration-200 ${
            disabled
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer hover:border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5'
          } ${isOpen && !isClosing ? 'border-gray-900 ring-2 ring-gray-900/5' : ''}`}
        >
          <span className={`truncate ${!value ? 'text-gray-400' : 'text-gray-900'}`}>
            {getSelectedLabel()}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
              isOpen && !isClosing ? 'rotate-180' : ''
            }`}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        {(isOpen || isClosing) && (
          <>
            {/* Overlay */}
            <div
              className={`fixed inset-0 z-40 bg-black/40 ${
                isClosing ? 'animate-fade-out' : 'animate-fade-in'
              }`}
              onClick={closeDropdown}
            />

            {/* Dropdown Panel with animations */}
            <div
              className={`fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-2xl bg-white shadow-lg ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 text-center">
                <h3 className="font-semibold text-gray-800">{label}</h3>
                {shouldShowSearch && (
                  <div className="mt-3 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>

              <div 
                className="overflow-y-auto transition-[height] duration-300 ease-in-out"
                style={{ height: listHeight ? `${listHeight}px` : 'auto', maxHeight: '60vh' }}
              >
                <div ref={listRef} className="p-4 pb-24">
                  {filteredOptions.length === 0 && searchQuery ? (
                    <div className="text-center text-gray-500 py-8 text-sm">No results found</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredOptions.map((opt, index) =>
                        'options' in opt ? (
                        <div key={index} className="col-span-2 mb-4 last:mb-0">
                          <div className="px-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {opt.label}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {opt.options.map((subOpt) => (
                              <button
                                key={subOpt.value}
                                type="button"
                                onClick={() => handleSelect(subOpt.value)}
                                className={`px-4 py-3 text-sm text-left rounded-lg transition-all ${
                                  value === subOpt.value
                                    ? 'bg-gray-900 text-white font-medium shadow-sm'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
                                }`}
                              >
                                {subOpt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className={`w-full px-4 py-3 text-sm text-left rounded-lg transition-all ${
                            value === opt.value
                              ? 'bg-gray-900 text-white font-medium shadow-sm'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}