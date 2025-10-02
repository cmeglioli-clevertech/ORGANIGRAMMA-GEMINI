import React, { useState, useEffect } from 'react';
import type { Node } from '../types';

interface FilterOptions {
  dipartimenti: Set<string>;
  uffici: Set<string>;
  ruoli: Set<string>;
}

// ✨ NUOVO: Filtri con selezioni multiple
interface ActiveFilters {
  sede: string | null;
  dipartimento: Set<string>;
  ufficio: Set<string>;
  ruolo: Set<string>;
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
    dipartimenti: new Set(),
    uffici: new Set(),
    ruoli: new Set()
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    sede: null,
    dipartimento: new Set<string>(),
    ufficio: new Set<string>(),
    ruolo: new Set<string>()
  });

  const [searchTerm, setSearchTerm] = useState<Record<string, string>>({
    dipartimento: '',
    ufficio: '',
    ruolo: ''
  });

  // Estrai tutte le opzioni di filtro dall'albero
  useEffect(() => {
    if (!tree) return;

    const options: FilterOptions = {
      dipartimenti: new Set(),
      uffici: new Set(),
      ruoli: new Set()
    };

    const extractOptions = (node: Node) => {
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

  // ✨ NUOVO: Toggle per selezioni multiple
  const handleFilterToggle = (filterType: 'dipartimento' | 'ufficio' | 'ruolo', value: string) => {
    const currentSet = new Set(activeFilters[filterType]);
    
    if (currentSet.has(value)) {
      currentSet.delete(value);
    } else {
      currentSet.add(value);
    }
    
    const newFilters = {
      ...activeFilters,
      [filterType]: currentSet
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearSingleFilter = (filterType: 'dipartimento' | 'ufficio' | 'ruolo') => {
    const newFilters = {
      ...activeFilters,
      [filterType]: new Set<string>()
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      sede: null,
      dipartimento: new Set<string>(),
      ufficio: new Set<string>(),
      ruolo: new Set<string>()
    };
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const removeSingleValue = (filterType: 'dipartimento' | 'ufficio' | 'ruolo', value: string) => {
    const currentSet = new Set(activeFilters[filterType]);
    currentSet.delete(value);
    
    const newFilters = {
      ...activeFilters,
      [filterType]: currentSet
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Conta i filtri attivi
  const activeFilterCount = 
    activeFilters.dipartimento.size + 
    activeFilters.ufficio.size + 
    activeFilters.ruolo.size;

  // Lista di tutti i tag attivi
  const activeFilterTags: Array<{type: 'dipartimento' | 'ufficio' | 'ruolo', value: string}> = [
    ...Array.from(activeFilters.dipartimento).map(v => ({ type: 'dipartimento' as const, value: v })),
    ...Array.from(activeFilters.ufficio).map(v => ({ type: 'ufficio' as const, value: v })),
    ...Array.from(activeFilters.ruolo).map(v => ({ type: 'ruolo' as const, value: v }))
  ];

  return (
    <>

      {/* Pannello filtri */}
      <div 
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎛️</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Filtri Avanzati</h2>
                  {activeFilterCount > 0 && (
                    <p className="text-xs text-purple-600 font-medium">
                      {activeFilterCount} {activeFilterCount === 1 ? 'filtro attivo' : 'filtri attivi'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                type="button"
                title="Chiudi pannello filtri"
              >
                <svg 
                  className="w-6 h-6 text-slate-600" 
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

            {/* Badge filtri attivi */}
            {activeFilterCount > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">FILTRI ATTIVI:</span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    type="button"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rimuovi tutti
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeFilterTags.map(({ type, value }) => (
                    <span
                      key={`${type}-${value}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                    >
                      {value}
                      <button
                        onClick={() => removeSingleValue(type, value)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                        type="button"
                        title={`Rimuovi ${value}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtri */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Filtro Dipartimento */}
            <MultiFilterSection
              title="Dipartimento"
              options={Array.from(filterOptions.dipartimenti).sort()}
              selectedValues={activeFilters.dipartimento}
              onToggle={(value) => handleFilterToggle('dipartimento', value)}
              onClear={() => clearSingleFilter('dipartimento')}
              icon="🏛️"
              searchTerm={searchTerm.dipartimento}
              onSearchChange={(term) => setSearchTerm(prev => ({ ...prev, dipartimento: term }))}
            />

            {/* Filtro Ufficio */}
            <MultiFilterSection
              title="Ufficio"
              options={Array.from(filterOptions.uffici).sort()}
              selectedValues={activeFilters.ufficio}
              onToggle={(value) => handleFilterToggle('ufficio', value)}
              onClear={() => clearSingleFilter('ufficio')}
              icon="🏪"
              searchTerm={searchTerm.ufficio}
              onSearchChange={(term) => setSearchTerm(prev => ({ ...prev, ufficio: term }))}
            />

            {/* Filtro Ruolo */}
            <MultiFilterSection
              title="Ruolo"
              options={Array.from(filterOptions.ruoli).sort()}
              selectedValues={activeFilters.ruolo}
              onToggle={(value) => handleFilterToggle('ruolo', value)}
              onClear={() => clearSingleFilter('ruolo')}
              icon="💼"
              searchTerm={searchTerm.ruolo}
              onSearchChange={(term) => setSearchTerm(prev => ({ ...prev, ruolo: term }))}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Usa i filtri per esplorare l'organigramma in modo più specifico.
              <br />
              <span className="text-slate-400">Chiudi questo pannello con il pulsante ✕</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// ✨ NUOVO: Componente per filtro multi-selezione con ricerca
interface MultiFilterSectionProps {
  title: string;
  options: string[];
  selectedValues: Set<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
  icon: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const MultiFilterSection: React.FC<MultiFilterSectionProps> = ({ 
  title, 
  options, 
  selectedValues,
  onToggle,
  onClear,
  icon,
  searchTerm,
  onSearchChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filtra opzioni in base al termine di ricerca
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedValues.size;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all flex items-center justify-between"
        type="button"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-slate-800">{title}</span>
          {selectedCount > 0 && (
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              {selectedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
              type="button"
              title="Rimuovi tutti"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Lista opzioni con ricerca */}
      {isExpanded && (
        <div className="bg-slate-50">
          {/* Barra di ricerca */}
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={`Cerca ${title.toLowerCase()}...`}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400"
                  onClick={(e) => e.stopPropagation()}
                />
                <svg 
                  className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Lista checkbox */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nessun risultato</p>
            ) : (
              filteredOptions.map(option => {
                const isSelected = selectedValues.has(option);
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-white ${
                      isSelected ? 'bg-purple-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(option)}
                      className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <span className={`text-sm flex-1 ${isSelected ? 'text-purple-700 font-semibold' : 'text-slate-700'}`}>
                      {option}
                    </span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
