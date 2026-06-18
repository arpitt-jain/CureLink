import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pharmacy } from '../types';
import { Navigation, Star, Clock, Phone, ChevronRight, MapPin } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored marker icons
const createColoredIcon = (color: string, isUser = false) => {
  const svgIcon = isUser
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="20" fill="${color}" opacity="0.15">
          <animate attributeName="r" values="16;20;16" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.25;0.08;0.25" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="21" cy="21" r="12" fill="${color}" stroke="white" stroke-width="3"/>
        <circle cx="21" cy="21" r="4" fill="white"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
        <filter id="shadow-${color.replace('#','')}" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
        </filter>
        <path d="M20 2C9.51 2 1 10.51 1 21c0 14.25 19 29 19 29s19-14.75 19-29C39 10.51 30.49 2 20 2z" fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow-${color.replace('#','')})"/>
        <circle cx="20" cy="19" r="9" fill="white" opacity="0.92"/>
        <text x="20" y="23.5" text-anchor="middle" font-size="14" font-weight="bold" fill="${color}" font-family="sans-serif">₹</text>
       </svg>`;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: isUser ? [42, 42] : [40, 52],
    iconAnchor: isUser ? [21, 21] : [20, 52],
    popupAnchor: isUser ? [0, -21] : [0, -52],
  });
};

const pharmacyTypeColors: Record<string, string> = {
  chain: '#4F46E5',
  online: '#7C3AED',
  govt: '#059669',
  retail: '#DC2626',
};

const pharmacyTypeLabels: Record<string, string> = {
  chain: 'Chain Pharmacy',
  online: 'Online Pickup',
  govt: 'Jan Aushadhi',
  retail: 'Retail Store',
};

interface Props {
  centerLat: number;
  centerLng: number;
  pharmacies: Pharmacy[];
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function FlyToPharmacy({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

export default function NearbyMap({ centerLat, centerLng, pharmacies }: Props) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  const bestOptionId = useMemo(() => {
    if (pharmacies.length === 0) return null;

    const priced = pharmacies.filter((item) => item.price !== undefined && item.price !== null);
    const prices = priced.map((item) => item.price as number);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
    const maxDistance = Math.max(...pharmacies.map((item) => item.distance || 0), 0.1);

    const scoreOf = (pharmacy: Pharmacy) => {
      const hasPrice = pharmacy.price !== undefined && pharmacy.price !== null;
      const normalizedPrice = hasPrice
        ? (pharmacy.price! - minPrice) / Math.max(maxPrice - minPrice, 1)
        : 1;
      const normalizedDistance = pharmacy.distance / Math.max(maxDistance, 0.1);
      const stockPenalty = pharmacy.in_stock ? 0 : 0.7;
      return normalizedPrice * 0.55 + normalizedDistance * 0.3 + stockPenalty;
    };

    return [...pharmacies].sort((a, b) => scoreOf(a) - scoreOf(b))[0]?.id ?? null;
  }, [pharmacies]);

  const userIcon = useMemo(() => createColoredIcon('#2563EB', true), []);

  const getMarkerIcon = useCallback((pharmacy: Pharmacy) => {
    const color = pharmacyTypeColors[pharmacy.type || 'retail'] || '#DC2626';
    return createColoredIcon(color);
  }, []);

  const handlePharmacyClick = useCallback((pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy.id);
    setFlyTarget([pharmacy.lat, pharmacy.lng]);
  }, []);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={11}
          fill={i < full ? '#FBBF24' : 'transparent'}
          stroke={i < full ? '#FBBF24' : '#6B7280'}
          strokeWidth={1.5}
        />
      );
    }
    return stars;
  };

  return (
    <div className="map-google-layout">
      {/* Sidebar pharmacy list */}
      <div className="map-sidebar">
        <div className="map-sidebar-header">
          <MapPin size={16} />
          <span>{pharmacies.length} pharmacies nearby</span>
        </div>
        <div className="map-sidebar-list">
          {pharmacies.map((pharm, idx) => (
            <div
              key={`sidebar-${pharm.id}-${pharm.price ?? 'np'}`}
              className={`map-sidebar-item ${selectedPharmacy === pharm.id ? 'active' : ''} ${pharm.id === bestOptionId ? 'best' : ''}`}
              onClick={() => handlePharmacyClick(pharm)}
            >
              <div className="sidebar-item-rank">{idx + 1}</div>
              <div className="sidebar-item-content">
                <div className="sidebar-item-name">
                  {pharm.name}
                  {pharm.id === bestOptionId && <span className="best-badge">Best</span>}
                </div>
                <div className="sidebar-item-address">{pharm.address}</div>
                <div className="sidebar-item-meta">
                  <span className="sidebar-item-distance">
                    <Navigation size={10} />
                    {pharm.distance.toFixed(1)} km
                  </span>
                  {pharm.rating && (
                    <span className="sidebar-item-rating">
                      <Star size={10} fill="#FBBF24" stroke="#FBBF24" />
                      {pharm.rating}
                    </span>
                  )}
                  {pharm.type && (
                    <span className={`sidebar-item-type type-${pharm.type}`}>
                      {pharmacyTypeLabels[pharm.type] || 'Retail'}
                    </span>
                  )}
                </div>
              </div>
              {pharm.price !== undefined && (
                <div className="sidebar-item-price">
                  <span className={pharm.in_stock ? 'in-stock' : 'out-stock'}>
                    ₹{pharm.price}
                  </span>
                  {pharm.in_stock ? (
                    <span className="stock-label stock-in">In Stock</span>
                  ) : (
                    <span className="stock-label stock-out">Out</span>
                  )}
                </div>
              )}
              <ChevronRight size={14} className="sidebar-item-arrow" />
            </div>
          ))}
          {pharmacies.length === 0 && (
            <div className="map-sidebar-empty">
              <MapPin size={20} />
              <p>No pharmacies found nearby</p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="map-main">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={12}
          className="map-container-google"
          zoomControl={false}
        >
          <ChangeView center={[centerLat, centerLng]} zoom={12} />
          <FlyToPharmacy target={flyTarget} />
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <Marker position={[centerLat, centerLng]} icon={userIcon}>
            <Popup>
              <div className="gmap-popup">
                <div className="gmap-popup-name">📍 Your Location</div>
                <div className="gmap-popup-coords">
                  {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>

          {pharmacies.map((pharm) => (
            <Marker
              key={`${pharm.id}-${pharm.price ?? 'np'}`}
              position={[pharm.lat, pharm.lng]}
              icon={getMarkerIcon(pharm)}
              eventHandlers={{
                click: () => setSelectedPharmacy(pharm.id),
              }}
            >
              <Popup>
                <div className="gmap-popup">
                  <div className="gmap-popup-name">{pharm.name}</div>
                  <div className="gmap-popup-address">{pharm.address}</div>

                  <div className="gmap-popup-rating-row">
                    <span className="gmap-popup-rating-num">{pharm.rating || 4.0}</span>
                    <div className="gmap-popup-stars">
                      {renderStars(pharm.rating || 4.0)}
                    </div>
                  </div>

                  <div className="gmap-popup-info-grid">
                    <div className="gmap-info-row">
                      <Navigation size={12} />
                      <span>{pharm.distance.toFixed(1)} km away</span>
                    </div>
                    {pharm.open_hours && (
                      <div className="gmap-info-row">
                        <Clock size={12} />
                        <span>{pharm.open_hours}</span>
                      </div>
                    )}
                    {pharm.phone && (
                      <div className="gmap-info-row">
                        <Phone size={12} />
                        <span>{pharm.phone}</span>
                      </div>
                    )}
                  </div>

                  {pharm.type && (
                    <span className={`gmap-popup-type-badge type-${pharm.type}`}>
                      {pharmacyTypeLabels[pharm.type] || 'Retail Store'}
                    </span>
                  )}

                  {pharm.price !== undefined && (
                    <div className="gmap-popup-price-section">
                      <div className="gmap-popup-price">
                        ₹{pharm.price}
                        {pharm.id === bestOptionId && (
                          <span className="gmap-popup-best">★ Best Option</span>
                        )}
                      </div>
                      <div className={`gmap-popup-stock ${pharm.in_stock ? 'in-stock' : 'out-stock'}`}>
                        {pharm.in_stock ? '● In Stock' : '○ Out of Stock'}
                      </div>
                    </div>
                  )}

                  <a
                    className="gmap-popup-directions"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharm.lat},${pharm.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation size={13} />
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map type legend */}
        <div className="map-legend">
          {Object.entries(pharmacyTypeLabels).map(([type, label]) => (
            <div key={type} className="map-legend-item">
              <span
                className="map-legend-dot"
                style={{ background: pharmacyTypeColors[type] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
