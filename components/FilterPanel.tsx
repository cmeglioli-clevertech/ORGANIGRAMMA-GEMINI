import React, { useState, useEffect } from 'react';
import type { Node } from '../types';

interface FilterOptions {
  sedi: Set<string>;
  dipartimenti: Set<string>;
  uffici: Set<string>;
  ruoli: Set<string>;
}

interface ActiveFilters {
  sede: string | null;
  dipartimento: string | null;
  ufficio: string | null;
  ruolo: string | null;
}

interface FilterPanelProps {
  tree: Node | null;
  onFilterChange: (filters: ActiveFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  tree, 
  onFilterChange, 
  isOpen, 
  onToggle 
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sedi: new Set(),
    dipartimenti: new Set(),
    uffici: new Set(),
    ruoli: new Set()
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    sede: null,
    dipartimento: null,
    ufficio: null,
    ruolo: null
  });

  // Estrai tutte le opzioni di filtro dall'albero
  useEffect(() => {
    if (!tree) return;

    const options: FilterOptions = {
      sedi: new Set(),
      dipartimenti: new Set(),
      uffici: new Set(),
      ruoli: new Set()
    };

    const extractOptions = (node: Node) => {
      // Aggiungi sede
      if (node.metadata?.sede) {
        options.sedi.add(node.metadata.sede);
      }
      
      // Aggiungi dipartimento
      if (node.department && node.department !== "Azienda") {
        options.dipartimenti.add(node.department);
      }
      
      // Aggiungi ufficio
      if (node.metadata?.office) {
        options.uffici.add(node.metadata.office);
      }
      
      // Aggiungi ruolo
      if (node.role && node.role !== "—") {
        options.ruoli.add(node.role);
      }

      // Ricorsione sui figli
      if (node.children) {
        node.children.forEach(child => extractOptions(child));
      }
    };

    extractOptions(tree);
    setFilterOptions(options);
  }, [tree]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: string | null) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      sede: null,
      dipartimento: null,
      ufficio: null,
      ruolo: null
    };
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v !== null).length;

  return (
    <>
      {/* Pulsante toggle filtri */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-24 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg border-2 border-slate-200 hover:border-blue-400 transition-all duration-300"
        type="button"
      >
        <svg 
          className="w-5 h-5 text-slate-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
          />
        </svg>
        <span className="text-slate-700 font-medium">Filtri</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Pannello filtri */}
      <div 
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Filtri Avanzati</h2>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                type="button"
              >
                <svg 
                  className="w-5 h-5 text-slate-500" 
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
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                type="button"
              >
                Rimuovi tutti i filtri ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Filtri */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Filtro Sede */}
            <FilterSection
              title="Sede"
              options={Array.from(filterOptions.sedi).sort()}
              value={activeFilters.sede}
              onChange={(value) => handleFilterChange('sede', value)}
              icon="🏢"
            />

            {/* Filtro Dipartimento */}
            <FilterSection
              title="Dipartimento"
              options={Array.from(filterOptions.dipartimenti).sort()}
              value={activeFilters.dipartimento}
              onChange={(value) => handleFilterChange('dipartimento', value)}
              icon="🏛️"
            />

            {/* Filtro Ufficio */}
            <FilterSection
              title="Ufficio"
              options={Array.from(filterOptions.uffici).sort()}
              value={activeFilters.ufficio}
              onChange={(value) => handleFilterChange('ufficio', value)}
              icon="🏪"
            />

            {/* Filtro Ruolo */}
            <FilterSection
              title="Ruolo"
              options={Array.from(filterOptions.ruoli).sort()}
              value={activeFilters.ruolo}
              onChange={(value) => handleFilterChange('ruolo', value)}
              icon="💼"
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500 text-center">
              Usa i filtri per esplorare l'organigramma in modo più specifico
            </p>
          </div>
        </div>
      </div>

      {/* Overlay quando il pannello è aperto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};

// Componente per singola sezione di filtro
interface FilterSectionProps {
  title: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  icon: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  options, 
  value, 
  onChange, 
  icon 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
        type="button"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-slate-700">{title}</span>
          {value && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              1 selezionato
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="max-h-48 overflow-y-auto p-2">
          <button
            onClick={() => onChange(null)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              value === null 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            type="button"
          >
            Tutti
          </button>
          {options.map(option => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                value === option 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
