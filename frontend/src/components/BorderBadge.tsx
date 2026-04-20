import React from 'react';
import { getCountryName } from '../utils/geo';

interface BorderBadgeProps {
  crossesBorder: boolean;
  countries: string[];
}

const BorderBadge: React.FC<BorderBadgeProps> = ({ crossesBorder, countries }) => {
  if (!crossesBorder || countries.length === 0) return null;

  const names = countries.map(getCountryName).join(' → ');

  return (
    <div className="border-badge">
      <span className="border-badge__icon">🌐</span>
      <div className="border-badge__content">
        <span className="border-badge__title">International Route</span>
        <span className="border-badge__countries">{names}</span>
      </div>
    </div>
  );
};

export default BorderBadge;
