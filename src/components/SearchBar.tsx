import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  resultCount?: number;
  placeholder?: string;
  containerClassName?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  resultCount = 0,
  placeholder = "Cerca persone, ruoli, dipartimenti...", 
  containerClassName
}) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const containerClasses = containerClassName ?? "w-full max-w-2xl mx-auto mb-8";

  // Keyboard shortcut per aprire la ricerca con "/"
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isActive) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isActive) {
        setQuery('');
        onSearch('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={containerClasses}>
      <div className={`relative transition-all duration-300 ${isActive ? 'scale-105' : ''}`}>
        {/* Icona di ricerca */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input di ricerca */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-24 py-4 text-lg rounded-2xl border-2 transition-all duration-300
            ${isActive 
              ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-white' 
              : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }
            focus:outline-none placeholder-slate-400`}
        />

        {/* Pulsanti azione */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Mostra numero risultati */}
          {query && (
            <span className="text-sm text-slate-500 mr-2">
              {resultCount} {resultCount === 1 ? 'risultato' : 'risultati'}
            </span>
          )}

          {/* Pulsante clear */}
          {query && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
              type="button"
              onMouseDown={(e) => e.preventDefault()} // Previene blur dell'input
            >
              <svg 
                className="w-4 h-4 text-slate-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}

          {/* Shortcut hint */}
          {!isActive && !query && (
            <kbd className="px-2 py-1 text-xs text-slate-500 bg-slate-100 rounded border border-slate-200">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Suggerimenti di ricerca */}
      {isActive && !query && (
        <div className="mt-3 text-sm text-slate-500 text-center animate-fadeIn">
          Prova: "Direttore", "Marketing", "CTH_UK" o un nome specifico
        </div>
      )}
    </div>
  );
};

export default SearchBar;
