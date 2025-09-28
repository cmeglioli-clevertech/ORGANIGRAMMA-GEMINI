import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Node } from '../types';
import OrgChartNode from './OrgChartNode';

interface NavigableOrgChartProps {
  tree: Node;
  onToggle: (nodeId: string) => void;
  highlightedNodes: Set<string>;
}

const NavigableOrgChart: React.FC<NavigableOrgChartProps> = ({
  tree,
  onToggle,
  highlightedNodes
}) => {
  return (
    <div className="w-full h-[80vh] border-2 border-slate-300 rounded-xl bg-white shadow-lg overflow-hidden">
      <TransformWrapper
        initialScale={0.8}
        minScale={0.3}
        maxScale={2}
        centerZoomedOut={true}
        centerOnInit={true}
        wheel={{
          wheelDisabled: false,
          touchPadDisabled: false,
          step: 0.1,
        }}
        panning={{
          disabled: false,
          velocityDisabled: false,
        }}
        pinch={{
          disabled: false,
        }}
        doubleClick={{
          disabled: false,
          mode: 'zoomIn',
          step: 0.3,
        }}
        limitToBounds={false}
        centerContent={true}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <>
            {/* Controlli di navigazione */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
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
                onClick={() => resetTransform()}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-md border-2 border-slate-200 hover:border-green-400 transition-colors text-slate-700 hover:text-green-600"
                type="button"
                title="Reset Vista"
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

            {/* Istruzioni utente */}
            <div className="absolute bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-slate-200">
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 border border-slate-400 rounded-sm flex items-center justify-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  </div>
                  <span>Rotellina: Zoom</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 border border-slate-400 rounded-sm bg-slate-100"></div>
                  <span>Trascina: Pan</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">2×</span>
                  <span>click: Zoom</span>
                </div>
              </div>
            </div>

            {/* Organigramma navigabile */}
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!cursor-grab active:!cursor-grabbing"
            >
              <div className="flex justify-center items-center min-h-full p-12">
                <OrgChartNode 
                  node={tree} 
                  onToggle={onToggle} 
                  depth={0}
                  highlightedNodes={highlightedNodes}
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default NavigableOrgChart;
