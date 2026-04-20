import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';
import { getCountryName } from '../utils/geo';

interface BorderBadgeProps {
  crossesBorder: boolean;
  countries: string[];
}

const BorderBadge: React.FC<BorderBadgeProps> = ({ crossesBorder, countries }) => {
  if (crossesBorder) {
    return (
      <div className="border-badge">
        <div className="border-badge__icon">
          <Globe size={16} />
        </div>
        <div className="border-badge__body">
          <span className="border-badge__title">Crosses border</span>
          <span className="border-badge__countries">
            {countries.map(c => getCountryName(c)).join(' → ')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-badge border-badge--none">
      <div className="border-badge__icon">
        <ShieldCheck size={16} />
      </div>
      <div className="border-badge__body">
        <span className="border-badge__title">Domestic route</span>
        <span className="border-badge__countries">
          {countries.length > 0 ? countries.map(c => getCountryName(c)).join(', ') : 'Single country'}
        </span>
      </div>
    </div>
  );
};

export default BorderBadge;
