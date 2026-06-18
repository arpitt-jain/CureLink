import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionClick?: (query: string) => void;
}

const SUGGESTIONS = ['Dolo 650', 'Crocin', 'Azithral', 'Combiflam', 'Pan D', 'Montek LC'];

export default function SearchBar({ onSearch, onSuggestionClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleSuggestion = useCallback((name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    if (onSuggestionClick) onSuggestionClick(name);
  }, [onSuggestionClick]);

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search medicines — Dolo 650, Crocin, Azithral, Pan D..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(!e.target.value);
          }}
        />
        <Search className="search-icon" size={20} />
      </div>

      {showSuggestions && !query && (
        <div className="suggestion-pills" style={{ marginTop: '1rem' }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-pill" onClick={() => handleSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
