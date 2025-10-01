import React, { useState, useEffect } from 'react';

const NavigationHint: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide dopo 8 secondi
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-blue-400 max-w-sm animate-pulse">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5l5-5 5 5M7 7l5 5 5-5" />
          </svg>
          <h3 className="font-bold text-lg">Navigazione Migliorata!</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
            <span>🖱️ <strong>Rotellina:</strong> Zoom in/out</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
            <span>✋ <strong>Trascina:</strong> Sposta la vista</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
            <span>👆 <strong>Doppio click:</strong> Zoom rapido</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold hover:bg-blue-50 transition-colors pointer-events-auto"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NavigationHint;
