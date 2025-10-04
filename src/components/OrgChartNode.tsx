import React from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Info,
  Building2,
  MapPin,
  Briefcase,
  Users as UsersIcon,
  User
} from 'lucide-react';
import type { Node } from "../types";
import QualificationBadge, { MODERN_QUALIFICATION_COLORS } from "./QualificationBadge";
import { useModal } from "../contexts/ModalContext";
import PlusIcon from "./icons/PlusIcon";
import MinusIcon from "./icons/MinusIcon";

/**
 * OrgChartNode v2.0 - Redesign Moderno
 * 
 * Caratteristiche:
 * - Card compatte: 320×400px (era 320×528px)
 * - Font più grande: 14px (era 12px)
 * - Badge minimali con icone
 * - Hover states fluidi
 * - Modal dettagli al click
 * - Design glassmorphism
 */

interface OrgChartNodeProps {
  node: Node;
  onToggle: (nodeId: string) => void;
  depth?: number;
  isHighlighted?: boolean;
  highlightedNodes?: Set<string>;
  visibleNodes?: Set<string> | null;
  isSearchNarrowed?: boolean;
  registerNodeElem?: (id: string, el: HTMLElement | null) => void;
}

const badgeColours: Record<Node["type"], string> = {
  root: "bg-emerald-50 text-emerald-600",
  ceo: "bg-amber-50 text-amber-600",
  sede: "bg-blue-50 text-blue-600",
  department: "bg-emerald-50 text-emerald-600",
  office: "bg-indigo-50 text-indigo-600",
  person: "bg-slate-100 text-slate-600",
  qualification: "bg-amber-50 text-amber-600",
  "role-group": "bg-emerald-50 text-emerald-600",
};

const borderColours: Record<Node["type"], string> = {
  root: "border-emerald-400",
  ceo: "border-amber-400",
  sede: "border-blue-400",
  department: "border-emerald-400",
  office: "border-indigo-400",
  person: "border-slate-300",
  qualification: "border-amber-400",
  "role-group": "border-emerald-400",
};

const OrgChartNode: React.FC<OrgChartNodeProps> = ({
  node,
  onToggle,
  depth = 0,
  isHighlighted = false,
  highlightedNodes = new Set(),
  visibleNodes = null,
  isSearchNarrowed = false,
  registerNodeElem,
}) => {
  const { openModal } = useModal();
  
  const allChildren = Array.isArray(node.children) ? node.children : [];
  const filteredChildren = isSearchNarrowed && visibleNodes
    ? allChildren.filter((child) => visibleNodes.has(child.id))
    : allChildren;

  if (isSearchNarrowed && visibleNodes && !visibleNodes.has(node.id)) {
    return null;
  }

  const hasChildren = filteredChildren.length > 0;
  const nodeExpanded = !!node.isExpanded;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(node.id);
  };

  // Click su pulsante info = apri modal globale
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(node);
  };

  // Click su footer = espandi/comprimi
  // Distingue tra click e drag per evitare toggle accidentali durante pan
  const handleFooterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Verifica che sia un vero click, non un drag
    // Se il mouse si è spostato molto, ignora il click
    const targetElement = e.target as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const isRealClick = Math.abs(e.clientX - rect.left - rect.width / 2) < 50;
    
    if (isRealClick && hasChildren) {
      onToggle(node.id);
    }
  };

  // Determina colore badge in base a tipo e qualifica
  let badgeColor = badgeColours[node.type];
  let badgeClasses = `${badgeColor} border`;
  
  if (node.type === "person" && node.metadata?.badgeColorClass) {
    const qualKey = node.metadata.qualificationKey || '';
    badgeColor = MODERN_QUALIFICATION_COLORS[qualKey] || badgeColor;
    badgeClasses = badgeColor;
  }

  const borderColor = borderColours[node.type];
  const shouldHighlight = isHighlighted || highlightedNodes.has(node.id);

  return (
    <div className="relative flex flex-col items-center overflow-visible">
      {/* CARD PRINCIPALE - Design Moderno Compatto con Z-INDEX ALTO */}
      <div
        ref={(el) => registerNodeElem?.(node.id, el)}
        id={`node-${node.id}`}
        data-node-id={node.id}
        className={`
          relative w-80 ${hasChildren ? 'h-[30rem]' : 'h-[28rem]'}
          bg-white rounded-xl shadow-lg 
          border-2 ${shouldHighlight ? 'border-blue-500 ring-4 ring-blue-200' : borderColor}
          overflow-visible
          transition-all duration-200 ease-out
          hover:shadow-xl hover:scale-[1.02]
          cursor-default
          group
        `}
        style={{ zIndex: 10 }}
      >
        {/* Badge in alto - Minimal con icone */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          {node.type === "person" && node.metadata?.qualification ? (
            <QualificationBadge
              qualification={node.metadata.qualification}
              qualificationKey={node.metadata.qualificationKey || ''}
              colorClass={node.metadata.badgeColorClass || ''}
              size="medium"
            />
          ) : (
            <div className={`
              ${badgeClasses}
              px-4 py-1.5 rounded-full 
              text-xs font-bold uppercase tracking-wider
              shadow-lg border-2
              transition-all duration-300
              group-hover:scale-110
            `}>
              {node.metadata?.badge || node.type}
            </div>
          )}
        </div>

        {/* Badge Bandierina Sede - In alto a sinistra (allineato con Info button) */}
        {node.type === "person" && node.metadata?.flag && (
          <div className="absolute top-3 left-3 w-10 h-10 rounded-full 
                          bg-white shadow-lg border-2 border-slate-200
                          flex items-center justify-center overflow-hidden z-20">
            <img 
              src={`https://flagcdn.com/w40/${node.metadata.flag}.png`}
              alt={node.metadata.sede}
              className="w-full h-full object-cover"
              title={node.metadata.sede}
            />
          </div>
        )}

        {/* Pulsante Info - Più grande e visibile */}
        <button
          onClick={handleInfoClick}
          className="absolute top-3 right-3 w-10 h-10 rounded-full 
                     bg-blue-500 text-white 
                     opacity-0 group-hover:opacity-100
                     transition-all duration-300
                     flex items-center justify-center
                     hover:bg-blue-600 hover:scale-110
                     shadow-lg z-20"
          aria-label="Mostra dettagli"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Foto/Icona - Bilanciata per spazio */}
        <div className="flex justify-center pt-5 pb-3">
          <div className="relative">
              <img
                src={node.imageUrl}
                alt={node.name}
              className="w-[160px] h-[160px] rounded-full border-4 border-white shadow-lg
                         object-cover
                         transition-transform duration-200
                         group-hover:scale-105"
            />
            
            {/* Badge flag per sedi */}
            {node.metadata?.flag && node.type === "sede" && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full 
                              bg-white shadow-lg border-2 border-slate-200
                              flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://flagcdn.com/w40/${node.metadata.flag}.png`}
                  alt={node.metadata.flag}
                className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          </div>
          
        {/* Informazioni Principali - Layout Ottimizzato */}
        <div className="flex flex-col">
          {/* Slot 1: Nome - Centrato, 2 righe */}
          <div className="min-h-[62px] flex items-center justify-center px-6 mb-5">
            <h3 className="text-[24px] font-bold text-slate-900 leading-tight line-clamp-2 text-center">
              {node.name}
            </h3>
          </div>

          {/* Info Persona - Allineamento a sinistra con padding */}
          {node.type === "person" && (
            <div className="flex flex-col space-y-3 px-8">
              {/* Slot 2: Mansione/Ruolo - Con icona User */}
              <div className="min-h-[32px] flex items-center">
                {(node.role || node.metadata?.mansione) ? (
                  <div className="flex items-center gap-3 text-slate-800">
                    <User className="w-5 h-5 flex-shrink-0 text-slate-500" />
                    <span className="text-[18px] font-bold line-clamp-2">
                      {node.metadata?.mansione || node.role}
                    </span>
                  </div>
                ) : (
                  <div className="h-[32px]" />
                )}
              </div>

              {/* Slot 3: Dipartimento */}
              <div className="min-h-[28px] flex items-center">
                {node.metadata?.department ? (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="w-5 h-5 flex-shrink-0 text-slate-500" />
                    <span className="text-[16px] font-semibold line-clamp-1">
                      {node.metadata.department}
                    </span>
                  </div>
                ) : (
                  <div className="h-[28px]" />
                )}
              </div>

              {/* Slot 4: Ufficio */}
              <div className="min-h-[28px] flex items-center">
                {node.metadata?.office ? (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Briefcase className="w-5 h-5 flex-shrink-0 text-slate-500" />
                    <span className="text-[16px] font-semibold line-clamp-1">
                      {node.metadata.office}
                    </span>
                  </div>
                ) : (
                  <div className="h-[28px]" />
                )}
              </div>
            </div>
          )}

          {/* Statistiche per nodi organizzativi */}
          {node.type !== "person" && node.metadata?.stats && (node.metadata.stats.people !== undefined || node.metadata.stats.directs !== undefined) && (
            <div className="pt-3 flex justify-center gap-4 text-[15px] text-slate-600">
              {node.metadata.stats.directs !== undefined && (
                <span className="font-bold">
                  {node.metadata.stats.directs} diretti
                </span>
              )}
              {node.metadata.stats.people !== undefined && node.metadata.stats.directs === undefined && (
                <span className="font-bold">
                  {node.metadata.stats.people} persone
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Cliccabile - Area di espansione/compressione - Ingrandito */}
        {hasChildren && (
          <button
            onClick={handleFooterClick}
            className={`
              absolute bottom-0 left-0 right-0 h-14
              flex items-center justify-center gap-2.5
              rounded-b-xl
              transition-all duration-200
              cursor-pointer
              ${nodeExpanded 
                ? 'bg-gradient-to-t from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100' 
                : 'bg-gradient-to-t from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100'
              }
              border-t-2 ${nodeExpanded ? 'border-emerald-300' : 'border-blue-300'}
              group/footer
            `}
            title={nodeExpanded ? 'Click per comprimere team' : 'Click per espandere team'}
            aria-label={nodeExpanded ? 'Comprimi team' : 'Espandi team'}
          >
            <span className={`text-[16px] font-bold ${nodeExpanded ? 'text-emerald-600' : 'text-blue-600'}`}>
              {nodeExpanded ? 'Comprimi Team' : 'Espandi Team'}
            </span>
            {nodeExpanded ? (
              <ChevronUp className="w-6 h-6 text-emerald-500 group-hover/footer:scale-110 transition-transform" />
            ) : (
              <ChevronDown className="w-6 h-6 text-blue-500 group-hover/footer:scale-110 transition-transform" />
            )}
          </button>
        )}

      </div>

      {/* FIGLI - Albero gerarchico con sistema CSS dinamico */}
      {hasChildren && nodeExpanded && (
        <div className="flex flex-col items-center overflow-visible">
          {/* Linea verticale verso figli - ATTACCATA ALLA CARD (no margin) */}
          <div className="bg-black shadow-sm" style={{ width: '4px', height: '48px', zIndex: 1 }} />

          {/* Contenitore figli con sistema linee dinamico */}
          <div className="flex items-start justify-center gap-8 overflow-visible relative">
            {/* Render ricorsivo figli con wrapper per linee CSS */}
            {filteredChildren.map((child, index) => {
              const isFirst = index === 0;
              const isLast = index === filteredChildren.length - 1;
              const isSingle = filteredChildren.length === 1;
              
              return (
                <div 
                  key={child.id} 
                  className="relative flex flex-col items-center overflow-visible"
                >
                  {/* Linea verticale che connette alla linea orizzontale - SEMPRE DIETRO LE CARD */}
                  <div className="bg-black shadow-sm" style={{ width: '4px', height: '48px', position: 'relative', zIndex: -1 }} />
                  
                  {/* Linea orizzontale sopra questo nodo - ESTESA PER COPRIRE GAP COMPLETO */}
                  {!isSingle && (
                    <div 
                      className="absolute bg-black"
                      style={{
                        height: '4px',
                        top: '0',
                        // Estende MOLTO di più: gap-8 = 32px, quindi estendo 20px da ogni lato per sicurezza
                        left: isFirst ? '50%' : '-20px',
                        width: isFirst ? 'calc(50% + 20px)' : (isLast ? 'calc(50% + 20px)' : 'calc(100% + 40px)'),
                        right: isLast ? '50%' : undefined,
                        zIndex: -1, // NEGATIVO per stare sempre dietro
                      }}
                    />
                  )}

                  {/* Nodo figlio ricorsivo */}
                  <OrgChartNode
                    node={child}
                    onToggle={onToggle}
                    depth={depth + 1}
                    isHighlighted={highlightedNodes.has(child.id)}
                    highlightedNodes={highlightedNodes}
                    visibleNodes={visibleNodes}
                    isSearchNarrowed={isSearchNarrowed}
                    registerNodeElem={registerNodeElem}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChartNode;
