import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Node } from '../types';
import OrgChartNode from './OrgChartNode';
import { useModal } from '../contexts/ModalContext';

interface NavigableOrgChartProps {
  tree: Node;
  onToggle: (nodeId: string) => void;
  highlightedNodes: Set<string>;
  visibleNodes?: Set<string> | null;
  isSearchNarrowed?: boolean;
  onCollapseAll: (centerView: (scale?: number, animationTime?: number) => void) => void;
  centerViewRef?: React.MutableRefObject<((scale?: number, animationTime?: number) => void) | null>;
}

const NavigableOrgChart: React.FC<NavigableOrgChartProps> = ({
  tree,
  onToggle,
  highlightedNodes,
  visibleNodes = null,
  isSearchNarrowed = false,
  onCollapseAll,
  centerViewRef: externalCenterViewRef
}) => {
  const nodeElemsRef = useRef<Map<string, HTMLElement>>(new Map());
  const centerViewRef = useRef<((scale?: number, animationTime?: number) => void) | null>(null);
  const hasInitialCentered = useRef(false);
  const currentScaleRef = useRef<number>(1);
  const { isModalOpen, resetZoomRef } = useModal();
  
  // 🎯 State per l'indicatore zoom (si aggiorna in tempo reale)
  const [currentZoom, setCurrentZoom] = useState<number>(100);
  
  // 🎯 Callback per aggiornare lo zoom quando cambia (chiamato da onTransformed)
  const handleTransformed = useCallback((ref: any, state: any) => {
    const newZoom = Math.round(state.scale * 100);
    setCurrentZoom(newZoom);
    currentScaleRef.current = state.scale;
  }, []);

  const registerNodeElem = useCallback((id: string, el: HTMLElement | null) => {
    const map = nodeElemsRef.current;
    if (el) {
      map.set(id, el);
    } else {
      map.delete(id);
    }
  }, []);

  // 🎯 Centro automaticamente la vista quando i dati sono caricati
  useEffect(() => {
    if (tree && centerViewRef.current && !hasInitialCentered.current) {
      // Aspetta un momento per permettere il rendering completo
      setTimeout(() => {
        if (centerViewRef.current) {
          centerViewRef.current(1, 0); // Scala 1, animazione istantanea
          hasInitialCentered.current = true;
        }
      }, 100);
    }
  }, [tree]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Sfondo con immagine dell'edificio Clevertech */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/building-background.jpg)',
          filter: 'blur(0px)'
        }}
      />
      <TransformWrapper
        initialScale={0.65}
        minScale={0.05}
        maxScale={5}
        centerZoomedOut={false}
        centerOnInit={true}
        onTransformed={handleTransformed}
        wheel={{
          wheelDisabled: isModalOpen,
          touchPadDisabled: isModalOpen,
          step: 0.1,
        }}
        panning={{
          disabled: isModalOpen,
          velocityDisabled: false,
        }}
        pinch={{
          disabled: isModalOpen,
        }}
        doubleClick={{
          disabled: isModalOpen,
          mode: 'zoomIn',
          step: 0.3,
        }}
        limitToBounds={false}
        centerContent={false}
        alignmentAnimation={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView, zoomToElement, state }) => {
          // Salva centerView e resetTransform nei ref
          centerViewRef.current = centerView;
          currentScaleRef.current = state?.scale || 1;
          
          // Esporta centerView al componente padre se richiesto
          if (externalCenterViewRef) {
            externalCenterViewRef.current = centerView;
          }
          
          // Reset zoom condizionale: solo se zoom > 1.3x
          resetZoomRef.current = () => {
            const currentScale = currentScaleRef.current;
            if (currentScale > 1.3) {
              // Zoom troppo alto, reset necessario per vedere modal
              resetTransform();
              setTimeout(() => centerView && centerView(1, 300), 50);
            }
            // Se zoom ≤ 1.3x, non fare nulla (modal visibile)
          };
          
          return (
          <>
            {/* 🎮 CONTROLLI NAVIGAZIONE ELEGANTI */}
            <div className="absolute top-20 right-4 z-50 flex flex-col items-center gap-2">
              
              {/* Indicatore Zoom - Design Coerente */}
              <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-center w-[72px]">
                <div className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Zoom</div>
                <div className="text-xl font-black text-blue-600 leading-none">
                  {currentZoom}%
                </div>
              </div>

              {/* Gruppo Zoom - Design Bilanciato */}
              <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 p-2 flex flex-col items-center gap-2 w-[72px]">
                <button
                  onClick={() => zoomIn(0.2)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-blue-50 transition-all text-blue-600 hover:text-blue-700 border border-transparent hover:border-blue-300"
                  type="button"
                  title="Zoom avanti"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </button>
                
                <div className="w-8 h-px bg-slate-200"></div>
                
                <button
                  onClick={() => zoomOut(0.2)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-blue-50 transition-all text-blue-600 hover:text-blue-700 border border-transparent hover:border-blue-300"
                  type="button"
                  title="Zoom indietro"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" />
                  </svg>
                </button>
              </div>

              {/* Gruppo Navigazione - Design Bilanciato */}
              <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 p-2 flex flex-col items-center gap-2 w-[72px]">
                {/* Comprimi Tutto */}
                <button
                  onClick={() => onCollapseAll(centerView)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-amber-50 transition-all text-amber-600 hover:text-amber-700 border border-transparent hover:border-amber-300"
                  type="button"
                  title="Comprimi tutto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                
                <div className="w-8 h-px bg-slate-200"></div>
                
                {/* Reset Vista */}
                <button
                  onClick={() => {
                    resetTransform();
                    setTimeout(() => centerView(1, 300), 50);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-green-50 transition-all text-green-600 hover:text-green-700 border border-transparent hover:border-green-300"
                  type="button"
                  title="Reset zoom 100%"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <div className="w-8 h-px bg-slate-200"></div>
                
                {/* Centra Vista */}
                <button
                  onClick={() => centerView()}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-purple-50 transition-all text-purple-600 hover:text-purple-700 border border-transparent hover:border-purple-300"
                  type="button"
                  title="Centra vista"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Organigramma navigabile */}
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!cursor-grab active:!cursor-grabbing"
            >
              <div className="flex justify-center items-center min-h-full p-12">
                {(() => {
                  // ✅ Scroll minimo compensativo: mantiene card cliccata visibile
                  const handleToggleWithStability = (id: string) => {
                    const el = nodeElemsRef.current.get(id);
                    
                    // Salva posizione attuale della card
                    const rectBefore = el?.getBoundingClientRect();
                    
                    // Esegui toggle
                    onToggle(id);
                    
                    // Dopo il rendering, controlla se la card è ancora visibile
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        if (!el || !rectBefore) return;
                        
                        const rectAfter = el.getBoundingClientRect();
                        
                        // Controlla se la card è uscita dal viewport o si è spostata troppo
                        const viewportHeight = window.innerHeight;
                        const isOutOfView = 
                          rectAfter.top < 0 || 
                          rectAfter.bottom > viewportHeight ||
                          Math.abs(rectAfter.top - rectBefore.top) > 200; // Spostamento > 200px
                        
                        if (isOutOfView) {
                          // Scroll minimo per mantenere visibile (non center, ma 'nearest')
                          el.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest',  // ✅ Scroll minimo, non centra
                            inline: 'nearest'
                          });
                        }
                      });
                    });
                  };

                  return (
                    <OrgChartNode 
                      node={tree} 
                      onToggle={handleToggleWithStability}
                      depth={0}
                      highlightedNodes={highlightedNodes}
                      visibleNodes={visibleNodes}
                      isSearchNarrowed={isSearchNarrowed}
                      registerNodeElem={registerNodeElem}
                    />
                  );
                })()}
              </div>
            </TransformComponent>
          </>
          );
        }}
      </TransformWrapper>
    </div>
  );
};

export default NavigableOrgChart;
