import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value?: string;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, value = '', disabled = false }) => {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!disabled) {
      const timeoutId = setTimeout(() => {
        onSearch(query);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [query, onSearch, disabled]);

  return (
    <div className="search-section">
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="search-input"
          placeholder="İsim, tip veya içerikte ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
        <Search 
          size={20} 
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#999',
            pointerEvents: 'none'
          }} 
        />
      </div>
    </div>
  );
};