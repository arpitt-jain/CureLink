import { FileText, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import ComparisonPanel from './ComparisonPanel';
import type { Medicine, PrescriptionAnalysis } from '../types';
import { useState } from 'react';

interface Props {
  results: PrescriptionAnalysis;
  onSelectMedicine: (med: Medicine) => void;
  userLat?: number;
  userLng?: number;
}

export default function PrescriptionResults({ results, onSelectMedicine, userLat, userLng }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  if (!results.matchedMedicines || results.matchedMedicines.length === 0) {
    return (
      <div className="glass-card prescription-results">
        <h3><FileText size={20} /> Prescription Analysis</h3>
        <p className="subtitle">
          No known medicines found in the prescription. Ensure the image has clear, printed text.
        </p>
        <details className="extracted-text-toggle">
          <summary>Show raw extracted text</summary>
          <pre className="extracted-text-box">{results.extractedText}</pre>
        </details>
      </div>
    );
  }

  const total = results.matchedMedicines.reduce((acc, curr) => acc + (curr.lowest_price || 0), 0);
  const totalHighest = results.matchedMedicines.reduce((acc, curr) => acc + (curr.highest_price || curr.lowest_price || 0), 0);
  const savings = totalHighest - total;
  const createSearchLink = (base: string, medicineName: string) =>
    `${base}${encodeURIComponent(medicineName)}`;
  const createNetmedsLink = (medicineName: string) =>
    `https://www.netmeds.com/catalogsearch/result/${encodeURIComponent(medicineName)}/all`;

  return (
    <div className="glass-card prescription-results fade-in-up">
      <h3><FileText size={20} /> Found {results.matchedMedicines.length} Medicines</h3>
      <p className="subtitle">
        We matched these from your prescription. Prices shown are the lowest available.
      </p>

      <div>
        {results.matchedMedicines.map((med, idx) => (
          <div key={idx} className="prescription-med-item">
            <div onClick={() => onSelectMedicine(med)} style={{ cursor: 'pointer' }}>
              <div className="med-name">{med.name}</div>
              <div className="med-generic">{med.generic_name}</div>
              {med.brief_use && <div className="med-use">{med.brief_use}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="med-price">
                ₹{med.lowest_price !== null ? med.lowest_price : '—'}
              </span>
              <button
                className="compare-toggle-btn"
                style={{ width: 'auto', padding: '0.35rem 0.7rem', marginTop: 0 }}
                onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === med.id ? null : med.id); }}
              >
                {expandedId === med.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expandedId === med.id ? 'Hide' : 'Compare'}
              </button>
              <button className="find-btn" onClick={() => onSelectMedicine(med)}>
                Find <ChevronRight size={12} />
              </button>
            </div>
            {expandedId === med.id && (
              <ComparisonPanel medicine={med} userLat={userLat} userLng={userLng} />
            )}
          </div>
        ))}
      </div>

      <div className="total-bar">
        <div>
          <div className="total-label">Estimated Best Total</div>
          {savings > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem' }}>
              You save ₹{savings} vs. highest prices
            </div>
          )}
        </div>
        <div className="total-amount">
          <span className="currency">₹</span>{total}
        </div>
      </div>

      <div className="prescription-compare-block">
        <h4>Compare all matched medicines</h4>
        <div className="prescription-compare-table">
          <div className="compare-row compare-head">
            <span>Medicine</span>
            <span>Best</span>
            <span>Highest</span>
            <span>Drop</span>
            <span>Buy links</span>
          </div>
          {results.matchedMedicines.map((med) => {
            const lowest = med.lowest_price ?? 0;
            const highest = med.highest_price ?? med.lowest_price ?? 0;
            const dropPct = highest > 0 ? Math.round(((highest - lowest) / highest) * 100) : 0;
            return (
              <div key={`compare-${med.id}`} className="compare-row">
                <span>{med.name}</span>
                <span>₹{lowest || '—'}</span>
                <span>₹{highest || '—'}</span>
                <span className={dropPct > 0 ? 'compare-drop' : ''}>
                  {dropPct > 0 ? `${dropPct}%` : '—'}
                </span>
                <span className="compare-links">
                  <a
                    href={createSearchLink('https://www.1mg.com/search/all?name=', med.name)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    1mg
                  </a>
                  <a
                    href={createSearchLink('https://pharmeasy.in/search/all?name=', med.name)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    PharmEasy
                  </a>
                  <a
                    href={createNetmedsLink(med.name)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Netmeds
                  </a>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <details className="extracted-text-toggle">
        <summary>Show raw extracted text</summary>
        <pre className="extracted-text-box">{results.extractedText}</pre>
      </details>
    </div>
  );
}
