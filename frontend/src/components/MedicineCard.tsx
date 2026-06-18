
import { TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { Medicine } from '../types';
export type { Medicine } from '../types';

interface Props {
  medicine: Medicine;
  onClick: (med: Medicine) => void;
  isSelected?: boolean;
  animDelay?: number;
  userLat?: number;
  userLng?: number;
  /** When true, the comparison panel is shown beneath this card */
  isExpanded?: boolean;
  onToggleExpand?: (med: Medicine) => void;
}

export default function MedicineCard({
  medicine,
  onClick,
  isSelected,
  animDelay = 0,
  isExpanded = false,
  onToggleExpand,
}: Props) {
  return (
    <div
      className={`glass-card medicine-card fade-in-up ${isSelected ? 'selected' : ''} ${isExpanded ? 'card-expanded' : ''}`}
      style={{ animationDelay: `${animDelay * 0.06}s` }}
    >
      <div className="medicine-card-main" onClick={() => onClick(medicine)}>
        <div className="medicine-info">
          <h3>{medicine.name}</h3>
          <p className="generic">{medicine.generic_name}</p>
          {medicine.brief_use && <p className="generic med-brief-use">{medicine.brief_use}</p>}
          <div className="meta-row">
            {medicine.category && (
              <span className="tag tag-category">{medicine.category}</span>
            )}
            {medicine.manufacturer && (
              <span className="tag tag-manufacturer">{medicine.manufacturer}</span>
            )}
            <span className={`tag ${medicine.available_pharmacies > 0 ? 'tag-available' : 'tag-unavailable'}`}>
              {medicine.available_pharmacies > 0
                ? `${medicine.available_pharmacies} stores`
                : 'Unavailable'}
            </span>
          </div>
        </div>
        <div className="medicine-price-block">
          <div className="price-tag">
            <span className="currency">₹</span>
            {medicine.lowest_price !== null ? medicine.lowest_price : '—'}
          </div>
          <div className="price-label">Lowest Price</div>
          {medicine.savings_percent != null && medicine.savings_percent > 0 && (
            <div className="savings-badge">
              <TrendingDown size={12} />
              Save {medicine.savings_percent}%
            </div>
          )}
        </div>
      </div>

      {/* Compare button */}
      <button
        className="compare-toggle-btn"
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand?.(medicine);
        }}
      >
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {isExpanded ? 'Hide Comparison' : 'Compare Prices'}
      </button>
    </div>
  );
}
