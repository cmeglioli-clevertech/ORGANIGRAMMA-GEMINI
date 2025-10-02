import React, { useCallback, useEffect, useRef } from 'react';
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
}

const NavigableOrgChart: React.FC<NavigableOrgChartProps> = ({
  tree,
  onToggle,
  highlightedNodes,
  visibleNodes = null,
  isSearchNarrowed = false,
  onCollapseAll
}) => {
  const nodeElemsRef = useRef<Map<string, HTMLElement>>(new Map());
  const centerViewRef = useRef<((scale?: number, animationTime?: number) => void) | null>(null);
  const hasInitialCentered = useRef(false);
  const currentScaleRef = useRef<number>(1);
  const { isModalOpen, resetZoomRef } = useModal();

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
        initialScale={1}
        minScale={0.05}
        maxScale={5}
        centerZoomedOut={false}
        centerOnInit={true}
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
            {/* Controlli di navigazione */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
              <button
                onClick={() => onCollapseAll(centerView)}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-md border-2 border-slate-200 hover:border-slate-400 transition-colors text-slate-700 hover:text-slate-900"
                type="button"
                title="Comprimi e centra vista"
                aria-label="Comprimi e centra vista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                </svg>
              </button>
              <button
                onClick={() => zoomIn(0.2)}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-md border-2 border-slate-200 hover:border-blue-400 transition-colors text-slate-700 hover:text-blue-600"
                type="button"
                title="Zoom In"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <button
                onClick={() => zoomOut(0.2)}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-md border-2 border-slate-200 hover:border-blue-400 transition-colors text-slate-700 hover:text-blue-600"
                type="button"
                title="Zoom Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  resetTransform();
                  setTimeout(() => centerView(1, 300), 50);
                }}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-md border-2 border-slate-200 hover:border-green-400 transition-colors text-slate-700 hover:text-green-600"
                type="button"
                title="Reset e Centra Vista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <button
                onClick={() => centerView()}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-md border-2 border-slate-200 hover:border-purple-400 transition-colors text-slate-700 hover:text-purple-600"
                type="button"
                title="Centra Vista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
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
