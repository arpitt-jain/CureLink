import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, MapPin, TrendingDown, Package, Clock } from 'lucide-react';
import type {
  Medicine,
  MedicinePriceComparisonResponse,
  OnlinePlatformLink,
  Pharmacy,
} from '../types';
import { buildApiUrl } from '../api';

interface Props {
  medicine: Medicine;
  userLat?: number;
  userLng?: number;
}

const fallbackOnlinePlatforms = [
  { name: 'Tata 1mg', getUrl: (q: string) => `https://www.1mg.com/search/all?name=${q}` },
  { name: 'PharmEasy', getUrl: (q: string) => `https://pharmeasy.in/search/all?name=${q}` },
  { name: 'Netmeds', getUrl: (q: string) => `https://www.netmeds.com/catalogsearch/result/${q}/all` },
  { name: 'Apollo Pharmacy', getUrl: (q: string) => `https://www.apollopharmacy.in/search-medicines/${q}` },
];

const getFallbackLinks = (encodedName: string): OnlinePlatformLink[] =>
  fallbackOnlinePlatforms.map((p) => ({ name: p.name, url: p.getUrl(encodedName) }));

export default function ComparisonPanel({ medicine, userLat, userLng }: Props) {
  const encodedName = encodeURIComponent(medicine.name);
  const [localPrices, setLocalPrices] = useState<Pharmacy[]>([]);
  const [onlineLinks, setOnlineLinks] = useState<OnlinePlatformLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPrices = async () => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (userLat !== undefined && userLng !== undefined) {
        params.set('lat', userLat.toString());
        params.set('lng', userLng.toString());
      }
      const qs = params.toString();
      const url = buildApiUrl(
        `/api/medicines/${medicine.id}/price-comparison${qs ? `?${qs}` : ''}`
      );

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Fetch failed');
        const data = (await res.json()) as MedicinePriceComparisonResponse;
        if (!cancelled) {
          setLocalPrices(data.localPrices || []);
          setOnlineLinks(data.onlinePlatforms || []);
        }
      } catch {
        if (!cancelled) setError('Unable to load prices right now.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPrices();
    return () => { cancelled = true; };
  }, [medicine.id, userLat, userLng]);

  const sortedPrices = useMemo(() => {
    if (localPrices.length === 0) return [];
    const priced = localPrices.filter((p) => p.price != null);
    return [...priced].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  }, [localPrices]);

  const platforms = useMemo(
    () => (onlineLinks.length > 0 ? onlineLinks : getFallbackLinks(encodedName)),
    [encodedName, onlineLinks]
  );

  const lowestPrice = sortedPrices[0]?.price ?? null;
  const highestPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1]?.price ?? null : null;

  return (
    <div className="comparison-panel-frame slide-down">
      {/* Header */}
      <div className="comparison-panel-header">
        <h4>
          <TrendingDown size={16} />
          Price Comparison for <strong>{medicine.name}</strong>
        </h4>
        {lowestPrice !== null && highestPrice !== null && highestPrice > lowestPrice && (
          <span className="comparison-save-chip">
            Save up to {Math.round(((highestPrice - lowestPrice) / highestPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="comparison-skeleton">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      )}

      {/* Error */}
      {error && <div className="comparison-error-msg">{error}</div>}

      {/* Local Pharmacy Prices */}
      {!isLoading && sortedPrices.length > 0 && (
        <div className="comparison-local-grid">
          <div className="comparison-section-label">
            <MapPin size={14} /> Nearby Pharmacies
          </div>
          <div className="comparison-table">
            <div className="comparison-table-header">
              <span>Pharmacy</span>
              <span>Distance</span>
              <span>Price</span>
              <span>Stock</span>
            </div>
            {sortedPrices.slice(0, 8).map((pharmacy, idx) => (
              <div
                key={`${pharmacy.id}`}
                className={`comparison-table-row ${idx === 0 ? 'best-price' : ''}`}
              >
                <div className="comparison-pharmacy-info">
                  <strong>{pharmacy.name}</strong>
                  {idx === 0 && <span className="best-badge">Best Price</span>}
                </div>
                <span className="comparison-distance">{pharmacy.distance.toFixed(1)} km</span>
                <span className="comparison-price">₹{pharmacy.price}</span>
                <span className={`comparison-stock ${pharmacy.in_stock ? 'in-stock' : 'out-stock'}`}>
                  {pharmacy.in_stock ? (
                    <><Package size={12} /> In Stock</>
                  ) : (
                    <><Clock size={12} /> Out</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No local prices */}
      {!isLoading && sortedPrices.length === 0 && !error && (
        <div className="comparison-empty-msg">
          No local inventory for this medicine. Try online platforms below.
        </div>
      )}

      {/* Online Platforms */}
      <div className="comparison-online-section">
        <div className="comparison-section-label">
          <ExternalLink size={14} /> Buy Online
        </div>
        <div className="comparison-online-grid">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="comparison-online-chip"
              onClick={(e) => e.stopPropagation()}
            >
              {p.name}
              <ExternalLink size={11} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
