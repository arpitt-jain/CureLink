import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Activity,
  Search as SearchIcon,
  FileUp,
  MapPin,
  Heart,
  Shield,
  Star,
  ArrowRight,
  Pill,
  Stethoscope,
  Clock,
  TrendingDown,
  Zap,
  Users,
  ChevronDown,
} from 'lucide-react';
import SearchBar from './components/SearchBar';
import MedicineCard from './components/MedicineCard';
import ComparisonPanel from './components/ComparisonPanel';
import NearbyMap from './components/NearbyMap';
import OCRUpload from './components/OCRUpload';
import PrescriptionResults from './components/PrescriptionResults';
import type { ApiResults, Medicine, Pharmacy, PrescriptionAnalysis } from './types';
import { buildApiUrl } from './api';

type TabType = 'search' | 'ocr';

const STATS = [
  { icon: Pill, value: '250K+', label: 'Medicines', color: '#818CF8' },
  { icon: MapPin, value: '15K+', label: 'Pharmacies', color: '#34D399' },
  { icon: TrendingDown, value: 'Up to 80%', label: 'Savings', color: '#22D3EE' },
  { icon: Users, value: '1M+', label: 'Users Trust Us', color: '#F472B6' },
];

const FEATURES = [
  {
    icon: SearchIcon,
    title: 'Smart Search',
    desc: 'Find any medicine instantly across 250,000+ records with real-time price comparison.',
    gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
  },
  {
    icon: Stethoscope,
    title: 'Prescription OCR',
    desc: 'Upload prescriptions — our AI reads handwritten & printed text to find your medicines.',
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
  },
  {
    icon: MapPin,
    title: 'Nearby Pharmacies',
    desc: 'Google Maps-like pharmacy finder with real-time stock, ratings & directions.',
    gradient: 'linear-gradient(135deg, #DC2626, #F43F5E)',
  },
  {
    icon: Shield,
    title: 'Trusted Prices',
    desc: 'Compare prices from Apollo, MedPlus, Jan Aushadhi & 15+ pharmacy chains.',
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
  },
];

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [expandedMedId, setExpandedMedId] = useState<number | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [ocrResults, setOcrResults] = useState<PrescriptionAnalysis | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
  const [pharmacyError, setPharmacyError] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<'locating' | 'granted' | 'fallback'>('locating');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showApp, setShowApp] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);

  // Default to Delhi coordinates for Indian demo
  const [userLoc, setUserLoc] = useState({ lat: 28.6139, lng: 77.2090 });

  useScrollReveal();

  const nearestPharmacyDistance = useMemo(() => {
    if (pharmacies.length === 0) return null;
    const minDistance = pharmacies.reduce((minSoFar, pharmacy) => {
      if (!Number.isFinite(pharmacy.distance)) return minSoFar;
      return Math.min(minSoFar, pharmacy.distance);
    }, Infinity);
    return Number.isFinite(minDistance) ? minDistance : null;
  }, [pharmacies]);

  const rankedPharmacies = useMemo(() => {
    if (pharmacies.length === 0) return [];

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

    return [...pharmacies].sort((a, b) => scoreOf(a) - scoreOf(b));
  }, [pharmacies]);

  const refreshLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setLocationState('locating');
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationState('granted');
        },
        (err) => {
          console.warn('Geolocation blocked. Using default Delhi coordinates.');
          setLocationError(err.message || 'Unable to read your location');
          setLocationState('fallback');
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 120000,
        }
      );
      return;
    }

    setLocationState('fallback');
    setLocationError('Geolocation is not supported in this browser.');
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLoc((prev) => {
          const latDiff = Math.abs(prev.lat - position.coords.latitude);
          const lngDiff = Math.abs(prev.lng - position.coords.longitude);
          // Ignore tiny GPS jitter to avoid repeated nearby-store refetches.
          if (latDiff < 0.0007 && lngDiff < 0.0007) return prev;
          return {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        });
        setLocationState('granted');
        setLocationError(null);
      },
      () => {
        // Keep existing coordinates and silently fallback to last known values.
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      lat: userLoc.lat.toString(),
      lng: userLoc.lng.toString(),
    });
    if (selectedMed) {
      params.set('medicine_id', selectedMed.id.toString());
    }
    const url = buildApiUrl(`/api/pharmacies/nearby?${params.toString()}`);

    setIsLoadingPharmacies(true);
    setPharmacyError(null);

    fetch(url)
      .then((res) => res.json())
      .then((data: ApiResults<Pharmacy>) => setPharmacies(data.results || []))
      .catch((err) => {
        console.error(err);
        setPharmacies([]);
        setPharmacyError('Unable to load nearby pharmacies right now.');
      })
      .finally(() => {
        setIsLoadingPharmacies(false);
      });
  }, [selectedMed, userLoc]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setSelectedMed(null);
      setSearchError(null);
      setExpandedMedId(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setExpandedMedId(null);
      const res = await fetch(
        buildApiUrl(`/api/medicines/search?q=${encodeURIComponent(query)}`)
      );
      if (!res.ok) {
        throw new Error('Search request failed');
      }
      const data = (await res.json()) as ApiResults<Medicine>;
      setSearchResults(data.results || []);
      if (!data.results || data.results.length === 0) setSelectedMed(null);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
      setSearchError('Could not search medicines. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const scrollToApp = useCallback(() => {
    setShowApp(true);
    setTimeout(() => {
      appSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleToggleExpand = useCallback((med: Medicine) => {
    setExpandedMedId((prev) => (prev === med.id ? null : med.id));
  }, []);

  return (
    <div className="app-root">
      {/* ── Navigation ── */}
      <nav className="nav-bar">
        <a href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Activity size={20} />
          </div>
          <span className="nav-logo-text">CureLink <span className="nav-logo-accent">Med</span></span>
        </a>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <button className="nav-cta" onClick={scrollToApp}>
            Start Comparing
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="hero-circle hero-circle-1" />
          <div className="hero-circle hero-circle-2" />
          <div className="hero-circle hero-circle-3" />
        </div>

        <div className="hero-content reveal-on-scroll">
          <div className="hero-badge">
            <Zap size={14} />
            <span>India's #1 Medicine Price Comparator</span>
          </div>

          <h1 className="hero-title">
            Find the <span className="hero-highlight">Lowest Medicine</span>
            <br />
            <span className="hero-highlight">Prices</span> Near You
          </h1>

          <p className="hero-subtitle">
            Compare prices across 18+ pharmacies, upload prescriptions for instant OCR analysis,
            and find the nearest stores — all in one place.
          </p>

          <div className="hero-cta-group">
            <button className="hero-btn-primary" onClick={scrollToApp}>
              <SearchIcon size={18} />
              Search Medicines
            </button>
            <button className="hero-btn-secondary" onClick={() => { setShowApp(true); setActiveTab('ocr'); scrollToApp(); }}>
              <FileUp size={18} />
              Upload Prescription
            </button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="hero-stats reveal-on-scroll">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="hero-stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <stat.icon size={22} style={{ color: stat.color }} />
              <div className="hero-stat-value">{stat.value}</div>
              <div className="hero-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="marquee-content">
              <span>Apollo Pharmacy</span><span className="marquee-dot">·</span>
              <span>MedPlus</span><span className="marquee-dot">·</span>
              <span>Jan Aushadhi Kendra</span><span className="marquee-dot">·</span>
              <span>Netmeds</span><span className="marquee-dot">·</span>
              <span>PharmEasy</span><span className="marquee-dot">·</span>
              <span>1mg Store</span><span className="marquee-dot">·</span>
              <span>Fortis HealthWorld</span><span className="marquee-dot">·</span>
              <span>Guardian Pharmacy</span><span className="marquee-dot">·</span>
              <span>Max Pharmacy</span><span className="marquee-dot">·</span>
              <span>Wellness Forever</span><span className="marquee-dot">·</span>
              <span>Medkart Pharmacy</span><span className="marquee-dot">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="features-container">
          <div className="section-label reveal-on-scroll">
            <Star size={14} />
            Features
          </div>
          <h2 className="section-title reveal-on-scroll">
            Everything you need to<br /><span className="text-gradient">save on medicines</span>
          </h2>

          <div className="features-grid">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="feature-card reveal-on-scroll" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="feature-icon-wrap" style={{ background: feature.gradient }}>
                  <feature.icon size={24} color="white" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section" id="how-it-works">
        <div className="how-container">
          <div className="section-label reveal-on-scroll">
            <Clock size={14} />
            How it works
          </div>
          <h2 className="section-title reveal-on-scroll">
            Save money in<br /><span className="text-gradient">3 simple steps</span>
          </h2>

          <div className="steps-row">
            <div className="step-card reveal-on-scroll" style={{ transitionDelay: '0s' }}>
              <div className="step-number">01</div>
              <h3>Search or Upload</h3>
              <p>Type any medicine name or upload your prescription image for instant OCR.</p>
            </div>
            <div className="step-connector reveal-on-scroll"><ArrowRight size={20} /></div>
            <div className="step-card reveal-on-scroll" style={{ transitionDelay: '0.15s' }}>
              <div className="step-number">02</div>
              <h3>Compare Prices</h3>
              <p>See prices from 18+ pharmacies near you with real-time stock availability.</p>
            </div>
            <div className="step-connector reveal-on-scroll"><ArrowRight size={20} /></div>
            <div className="step-card reveal-on-scroll" style={{ transitionDelay: '0.3s' }}>
              <div className="step-number">03</div>
              <h3>Save & Navigate</h3>
              <p>Pick the cheapest option and get Google Maps directions to the pharmacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Scroll to App ── */}
      {!showApp && (
        <section className="cta-section reveal-on-scroll">
          <h2>Ready to save on your medicines?</h2>
          <p>Start comparing prices now — it's free and takes 10 seconds.</p>
          <button className="hero-btn-primary" onClick={scrollToApp}>
            <SearchIcon size={18} />
            Get Started Free
          </button>
          <div className="cta-scroll-indicator" onClick={scrollToApp}>
            <ChevronDown size={24} />
          </div>
        </section>
      )}


      {/* ── Main App Section ── */}
      {showApp && (
        <div ref={appSectionRef} className="app-section">
          <div className="app-container">
            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                <SearchIcon size={16} />
                Search Medicine
              </button>
              <button
                className={`tab ${activeTab === 'ocr' ? 'active' : ''}`}
                onClick={() => setActiveTab('ocr')}
              >
                <FileUp size={16} />
                Upload Prescription
              </button>
            </div>

            {/* Main Content */}
            <main>
              {activeTab === 'search' && (
                <>
                  <SearchBar onSearch={handleSearch} />
                  <div className="main-grid">
                    {/* Left: Results */}
                    <div>
                      {searchResults.length > 0 && (
                        <div className="section-header">
                          <h3>
                            <SearchIcon size={18} />
                            Search Results
                            <span className="count-badge">{searchResults.length}</span>
                          </h3>
                          <p>Click a medicine to see pharmacies on the map</p>
                        </div>
                      )}

                      <div className="results-list">
                        {isSearching && (
                          <div className="glass-card empty-state compact-state">
                            <h4>Searching medicines...</h4>
                          </div>
                        )}
                        {searchError && (
                          <div className="glass-card empty-state compact-state error-state">
                            <h4>Search error</h4>
                            <p>{searchError}</p>
                          </div>
                        )}
                        {!isSearching && !searchError && searchResults.length === 0 && (
                          <div className="glass-card empty-state">
                            <div className="empty-icon">
                              <SearchIcon size={28} />
                            </div>
                            <h4>Search for a Medicine</h4>
                            <p>
                              Type a medicine name like Dolo 650, Crocin, or Azithral to compare
                              prices across pharmacies in your area.
                            </p>
                          </div>
                        )}

                        {searchResults.map((med, idx) => (
                          <div key={med.id}>
                            <MedicineCard
                              medicine={med}
                              onClick={(m) => setSelectedMed(m)}
                              isSelected={selectedMed?.id === med.id}
                              animDelay={idx}
                              userLat={userLoc.lat}
                              userLng={userLoc.lng}
                              isExpanded={expandedMedId === med.id}
                              onToggleExpand={handleToggleExpand}
                            />
                            {/* ─── Comparison panel below card ─── */}
                            {expandedMedId === med.id && (
                              <ComparisonPanel
                                medicine={med}
                                userLat={userLoc.lat}
                                userLng={userLoc.lng}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Map */}
                    <div className="map-section">
                      <div className="section-header">
                        <h3>
                          <MapPin size={18} />
                          {selectedMed ? `Pharmacies with ${selectedMed.name}` : 'Nearby Pharmacies'}
                          {pharmacies.length > 0 && <span className="count-badge">{pharmacies.length}</span>}
                        </h3>
                        <p>
                          {selectedMed
                            ? 'Sorted by distance · tap a marker for details'
                            : 'Showing pharmacies near you'}
                        </p>
                        <div className="location-strip">
                          <span>
                            {locationState === 'granted'
                              ? 'Using your current location'
                              : locationState === 'locating'
                                ? 'Detecting your location...'
                                : 'Using Delhi fallback location'}
                          </span>
                          {nearestPharmacyDistance !== null && (
                            <span className="location-distance-chip">
                              Nearest store: {nearestPharmacyDistance.toFixed(1)} km
                            </span>
                          )}
                          <button type="button" onClick={refreshLocation} className="location-retry-btn">
                            Refresh location
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserLoc({ lat: 28.6139, lng: 77.2090 });
                              setLocationState('fallback');
                              setLocationError(null);
                            }}
                            className="location-retry-btn location-fallback-btn"
                          >
                            Use Delhi
                          </button>
                        </div>
                        {locationError && <div className="location-error-text">{locationError}</div>}
                      </div>
                      <NearbyMap
                        centerLat={userLoc.lat}
                        centerLng={userLoc.lng}
                        pharmacies={rankedPharmacies}
                      />
                      {isLoadingPharmacies && (
                        <div className="map-status">Loading nearby pharmacies...</div>
                      )}
                      {pharmacyError && (
                        <div className="map-status map-status-error">{pharmacyError}</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'ocr' && (
                <div className="main-grid">
                  <div>
                    <OCRUpload onResults={setOcrResults} />
                    {ocrResults && (
                      <PrescriptionResults
                        results={ocrResults}
                        userLat={userLoc.lat}
                        userLng={userLoc.lng}
                        onSelectMedicine={(med) => {
                          setSelectedMed(med);
                          setActiveTab('search');
                          handleSearch(med.name);
                        }}
                      />
                    )}
                  </div>
                  <div className="map-section">
                    <div className="section-header">
                      <h3>
                        <MapPin size={18} />
                        Nearby Pharmacies
                        {pharmacies.length > 0 && <span className="count-badge">{pharmacies.length}</span>}
                      </h3>
                      <p>Pharmacies near your location</p>
                    </div>
                    <NearbyMap
                      centerLat={userLoc.lat}
                      centerLng={userLoc.lng}
                      pharmacies={rankedPharmacies}
                    />
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo">
              <div className="nav-logo-icon">
                <Activity size={18} />
              </div>
              <span className="nav-logo-text">CureLink <span className="nav-logo-accent">Med</span></span>
            </div>
            <p>Compare · Save · Heal — India's smarter way to buy medicines.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#">Pricing</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            Made with <Heart size={12} style={{ display: 'inline', verticalAlign: 'middle', color: '#f87171' }} /> in India · CureLink Med © 2026
          </p>
          <p className="footer-disclaimer">
            Prices are for reference only. Always consult your doctor before taking any medicine.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
