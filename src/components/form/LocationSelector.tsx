'use client';

import { midsayapProper, outsideMidsayap } from '../../lib/routeData';
import Dropdown, { DropdownOptgroup } from '../Dropdown';

interface LocationSelectorProps {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

export default function LocationSelector({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: LocationSelectorProps) {
  const withinTownOptions = options.filter(p => midsayapProper.includes(p));
  const outsideTownOptions = options.filter(p => outsideMidsayap.includes(p));

  const dropdownOptions: DropdownOptgroup[] = [];

  if (withinTownOptions.length > 0) {
    dropdownOptions.push({
      label: '🏘️ Within Town',
      options: withinTownOptions.map(p => ({ value: p, label: p })),
    });
  }

  if (outsideTownOptions.length > 0) {
    dropdownOptions.push({
      label: '🌄 Outside Town',
      options: outsideTownOptions.map(p => ({ value: p, label: p })),
    });
  }

  return (
    <div className="w-full min-w-[150px]">
      <Dropdown
        label={label}
        icon={icon}
        value={value}
        onChange={onChange}
        options={dropdownOptions}
        placeholder={placeholder}
        disabled={disabled}
        // Add a prop to disable animation if supported, e.g.,
        // disableAnimation={true}
      />
    </div>
  );
}