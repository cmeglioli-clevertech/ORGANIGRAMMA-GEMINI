import React from "react";
import type { Node } from "../types";
import PlusIcon from "./icons/PlusIcon";
import MinusIcon from "./icons/MinusIcon";

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
  root: "bg-emerald-100 text-emerald-700",
  ceo: "bg-amber-100 text-amber-700",
  sede: "bg-blue-100 text-blue-700",
  department: "bg-emerald-100 text-emerald-700",
  office: "bg-indigo-100 text-indigo-700",
  person: "bg-slate-200 text-slate-600", // Override dinamico per qualifiche
  qualification: "bg-amber-100 text-amber-700",
  "role-group": "bg-emerald-100 text-emerald-700",
};

const QUALIFICATION_BADGE_FALLBACK = "bg-slate-200 text-slate-600 border-slate-200";

// Colori specifici per qualifiche (nuova tassonomia + retrocompatibilità)
const qualificationColors: Record<string, string> = {
  dirigente: "bg-red-100 text-red-800 border-red-200",
  "direttivo (quadro / gestione del cambiamento)": "bg-orange-100 text-orange-800 border-orange-200",
  "direttivo-quadro-gestione-del-cambiamento": "bg-orange-100 text-orange-800 border-orange-200",
  "quadro / direttore": "bg-orange-100 text-orange-800 border-orange-200",
  "quadro-direttore": "bg-orange-100 text-orange-800 border-orange-200",
  quadro: "bg-orange-100 text-orange-800 border-orange-200",
  "direttivo (responsabile di team/processi)": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "direttivo-responsabile-di-team-processi": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "responsabile di team/area": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "direttivo (tecnico/organizzativo)": "bg-blue-100 text-blue-800 border-blue-200",
  "direttivo-tecnico-organizzativo": "bg-blue-100 text-blue-800 border-blue-200",
  "impiegato direttivo": "bg-blue-100 text-blue-800 border-blue-200",
  "tecnico specializzato": "bg-green-100 text-green-800 border-green-200",
  "tecnico-specializzato": "bg-green-100 text-green-800 border-green-200",
  "specialista (impiegatizio/tecnico)": "bg-green-100 text-green-800 border-green-200",
  "specialista impiegatizio": "bg-green-100 text-green-800 border-green-200",
  "specialista tecnico": "bg-green-100 text-green-800 border-green-200",
  specialista: "bg-green-100 text-green-800 border-green-200",
  "tecnico qualificato": "bg-purple-100 text-purple-800 border-purple-200",
  "tecnico-qualificato": "bg-purple-100 text-purple-800 border-purple-200",
  "impiegato qualificato": "bg-purple-100 text-purple-800 border-purple-200",
  "tecnico esecutivo": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "tecnico-esecutivo": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "impiegato esecutivo": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "operativo specializzato": "bg-amber-100 text-amber-800 border-amber-200",
  "operativo-specializzato": "bg-amber-100 text-amber-800 border-amber-200",
  "operaio specializzato": "bg-amber-100 text-amber-800 border-amber-200",
  "operativo qualificato": "bg-rose-100 text-rose-800 border-rose-200",
  "operativo-qualificato": "bg-rose-100 text-rose-800 border-rose-200",
  "operaio qualificato": "bg-rose-100 text-rose-800 border-rose-200",
  "operativo base": "bg-gray-100 text-gray-800 border-gray-200",
  "operativo-base": "bg-gray-100 text-gray-800 border-gray-200",
  "operaio comune": "bg-gray-100 text-gray-800 border-gray-200",
  "operaio generico": "bg-gray-100 text-gray-800 border-gray-200",
  "apprendista impiegato": "bg-lime-100 text-lime-800 border-lime-200",
  "apprendista-impiegato": "bg-lime-100 text-lime-800 border-lime-200",
  "apprendista operaio": "bg-stone-100 text-stone-800 border-stone-200",
  "apprendista-operaio": "bg-stone-100 text-stone-800 border-stone-200",
};

const borderColours: Record<Node["type"], string> = {
  root: "border-emerald-500",
  ceo: "border-amber-500",
  sede: "border-blue-500",
  department: "border-emerald-500",
  office: "border-indigo-500",
  person: "border-slate-300",
  qualification: "border-amber-500",
  "role-group": "border-emerald-500",
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
  const allChildren = Array.isArray(node.children) ? node.children : [];
  const filteredChildren = isSearchNarrowed && visibleNodes
    ? allChildren.filter((child) => visibleNodes.has(child.id))
    : allChildren;

  if (isSearchNarrowed && visibleNodes && !visibleNodes.has(node.id)) {
    return null;
  }

  const hasVisibleChildren = filteredChildren.length > 0;
  const hasChildren = allChildren.length > 0;
  const computedHasChildren = isSearchNarrowed ? hasVisibleChildren : hasChildren;
  const shouldHighlight = isHighlighted || highlightedNodes.has(node.id);
  const isForcedExpanded = Boolean(
    isSearchNarrowed && visibleNodes && visibleNodes.has(node.id) && hasVisibleChildren
  );
  const isExpandedState = node.isExpanded ?? false;
  const effectiveIsExpanded = isForcedExpanded ? true : isExpandedState;
  const toggleDisabled = Boolean(isSearchNarrowed && visibleNodes);
  const childrenToRender = filteredChildren;
  const showChildren = effectiveIsExpanded && childrenToRender.length > 0;

  // Badge con colori specifici per qualifiche
  const isPersonNode = node.type === "person" || node.type === "ceo";

  const badge = isPersonNode 
    ? (node.metadata?.qualification ?? "N/D")
    : (node.metadata?.badge ?? node.type.toUpperCase());
  
  // Usa colori specifici per qualifiche se è una persona
  let badgeClass: string;
  if (isPersonNode) {
    if (node.metadata?.badgeColorClass) {
      badgeClass = node.metadata.badgeColorClass;
    } else if (node.metadata?.qualificationKey) {
      const qualificationKey = node.metadata.qualificationKey.toLowerCase();
      badgeClass = qualificationColors[qualificationKey] ?? QUALIFICATION_BADGE_FALLBACK;
    } else if (node.metadata?.qualification) {
      const qualificationKey = node.metadata.qualification.toLowerCase();
      badgeClass = qualificationColors[qualificationKey] ?? QUALIFICATION_BADGE_FALLBACK;
    } else {
      badgeClass = QUALIFICATION_BADGE_FALLBACK;
    }
  } else {
    badgeClass = badgeColours[node.type] ?? "bg-slate-200 text-slate-600";
  }
  
  const borderClass = borderColours[node.type] ?? "border-slate-300";

  // Layout per persone: Nome, Mansione, Ufficio
  const title = node.name;
  let subtitle: string;
  let highlightName: string;
  let highlightLabel: string = "Ufficio";

  if (node.type === "person" || node.type === "ceo") {
    // Mostra: Nome, Mansione, Ufficio
    subtitle = node.metadata?.mansione ?? (node.role || "N/D");
    highlightName = node.metadata?.office ?? "N/D";
    highlightLabel = "Ufficio";
  } else if (node.type === "department") {
    // Dipartimenti: non mostrare qualifica/ruolo come sottotitolo
    subtitle = "";
    highlightName = node.responsible ?? "N/D";
    highlightLabel = "Direttore";
  } else if (node.type === "office") {
    // Uffici: non mostrare qualifica/ruolo come sottotitolo  
    subtitle = "";
    highlightName = node.responsible ?? "N/D";
    highlightLabel = "Responsabile";
  } else {
    subtitle = node.metadata?.qualification ?? (node.role || "N/D");
    highlightName = node.responsible ?? "N/D";
    if (node.type === "sede") {
      highlightLabel = "Direttore";
    } else if (node.type === "root") {
      highlightLabel = "Responsabile";
    }
  }
  const mansione = node.metadata?.mansione ?? (node.role || "N/D");
  const age = node.metadata?.age != null ? String(node.metadata?.age) : "N/D";
  const order = node.metadata?.order != null ? String(node.metadata?.order) : node.order != null ? String(node.order) : "N/D";
  const stats = node.metadata?.stats as Record<string, number> | undefined;
  const officePurpose = (node.metadata as Record<string, unknown> | undefined)?.officePurpose as
    | string
    | undefined;

  const reportsTo = (node.metadata as Record<string, unknown> | undefined)?.reportsTo as
    | string
    | undefined;

  const formatCount = (value?: number) =>
    value !== undefined && value !== null ? value.toLocaleString("it-IT") : "N/D";

  const infoItems: Array<{ label: string; value: string }> = [];

  const addStat = (label: string, value?: number) => {
    infoItems.push({ label, value: formatCount(value) });
  };

  // Informazioni specifiche per tipo di scheda
  switch (node.type) {
    case "root":
      // Root: REFA - Holding con presidente e statistiche
      infoItems.push({ label: "Presidente", value: "Giuseppe Reggiani" });
      if (stats) {
        if (stats.sites !== undefined) {
          addStat("Sedi", stats.sites);
          addStat("Dipartimenti", stats.departments);
          addStat("Uffici", stats.offices);
        } else if (stats.leaders !== undefined) {
          addStat("Leader", stats.leaders);
        }
        addStat("Persone", stats.people);
      }
      break;

    case "ceo":
      // CEO: Informazioni executive + responsabilità globali
      infoItems.push({ label: "Qualifica", value: node.metadata?.qualification || "Dirigente" });
      infoItems.push({ label: "Sede principale", value: node.metadata?.sede || "CTH_ITALY" });
      if (stats?.directs !== undefined) {
        addStat("Diretti", stats.directs);
        addStat("Report totali", stats.totalReports);
      }
      infoItems.push({ label: "Responsabilità", value: "Strategia aziendale globale" });
      break;

    case "sede":
      // Sede: Informazioni geografiche e responsabile locale
      infoItems.push({ label: "Direttore", value: highlightName && highlightName !== "N/D" ? highlightName : "REFA" });
      infoItems.push({ label: "Sede", value: node.location });
      if (stats) {
        addStat("Dipartimenti", stats.departments);
        addStat("Uffici", stats.offices);
        addStat("Persone", stats.people);
      }
      break;

    case "department":
      // Dipartimento: Focus su struttura organizzativa e obiettivi
      if (highlightName !== "N/D") {
        infoItems.push({ label: "Direttore", value: highlightName });
      } else {
        infoItems.push({ label: "Direttore", value: "REFA" });
      }
      infoItems.push({ label: "Sede principale", value: node.location });
      if (stats) {
        addStat("Uffici", stats.offices);
        addStat("Persone", stats.people);
      }
      infoItems.push({ label: "Obiettivi", value: "Operatività dipartimentale" });
      break;

    case "office":
      // Ufficio: Dettagli operativi e progetti
      if (highlightName !== "N/D") {
        infoItems.push({ label: "Responsabile", value: highlightName });
      }
      infoItems.push({ label: "Dipartimento", value: node.department });
      if (officePurpose) {
        infoItems.push({ label: "Scopo", value: officePurpose });
      }
      addStat("Persone", stats?.people);
      infoItems.push({ label: "Progetti attivi", value: "Da definire" });
      break;

    case "person":
      {
        // Qualifica rimossa dalle info perché già nel badge
        if (node.metadata?.company) {
          infoItems.push({ label: "Azienda", value: node.metadata.company });
        }

        // Sede rimossa dalle info perché già visibile sopra con la bandiera
        infoItems.push({ label: "Età", value: age });

        const gender = node.metadata?.gender;
        if (gender) {
          const genderLabel = gender === "M" ? "Maschio" : gender === "F" ? "Femmina" : gender;
          infoItems.push({ label: "Sesso", value: genderLabel });
        }

        if (stats?.directs !== undefined) {
          addStat("Diretti", stats.directs);
          addStat("Report totali", stats.totalReports);
        } else {
          infoItems.push({ label: "Diretti", value: "0" });
          infoItems.push({ label: "Report totali", value: "0" });
        }

        if (reportsTo) {
          infoItems.push({ label: "Responsabile", value: reportsTo });
        }

        // Campo competenze chiave (per futura implementazione)
        infoItems.push({ label: "Competenze chiave", value: "" });
      }
      break;

    case "qualification":
      // Qualifica: Informazioni sul livello gerarchico
      if (highlightName !== "N/D") {
        infoItems.push({ label: "Responsabile", value: highlightName });
      }
      if (stats) {
        addStat("Ruoli", stats.roles);
        addStat("Persone", stats.people);
      }
      infoItems.push({ label: "Livello", value: node.role });
      break;

    case "role-group":
      // Gruppo ruoli: Informazioni aggregate
      if (highlightName !== "N/D") {
        infoItems.push({ label: "Responsabile", value: highlightName });
      }
      addStat("Persone", stats?.people);
      infoItems.push({ label: "Tipo gruppo", value: node.role });
      break;

    default:
      // Fallback per tipi non gestiti
      if (mansione !== "N/D") {
        infoItems.push({ label: "Mansione", value: mansione });
      }
      if (stats?.people !== undefined) {
        addStat("Persone", stats.people);
      }
  }

  return (
    <div className={`flex flex-col items-center ${depth > 0 ? "tree-branch" : ""}`}>
      <div
        ref={(el) => registerNodeElem?.(node.id, el)}
        className={`relative flex flex-col w-80 h-[33rem] rounded-2xl border bg-white shadow-lg transition-all duration-300 pb-10 ${borderClass} ${
          shouldHighlight
            ? "ring-4 ring-amber-300 ring-offset-2 ring-offset-white"
            : "ring-1 ring-slate-100"
        }`}
      >
        <span className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-tight shadow border whitespace-nowrap ${badgeClass}`}>
          {badge}
        </span>

        <div className="flex flex-col items-center px-6 pt-6 pb-4 text-center h-72">
          <div 
            className="overflow-hidden rounded-full border-6 border-white shadow-inner bg-slate-100 flex items-center justify-center"
            style={{ width: '8rem', height: '8rem', minWidth: '8rem', minHeight: '8rem' }}
          >
            {node.type === "sede" ? (
              <img
                src={node.imageUrl}
                alt={node.name}
                className="w-full h-full object-cover"
                style={{ aspectRatio: '1/1' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (node.imageUrl ? (
              <img
                src={node.imageUrl}
                alt={node.name}
                className="w-full h-full object-cover"
                style={{ aspectRatio: '1/1' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              // Placeholder
              <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ))}
          </div>
          
          {/* Nome */}
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
          
          {/* Mansione */}
          {subtitle && subtitle !== "N/D" && (
            <p className="mt-1 text-sm font-medium text-blue-600">{subtitle}</p>
          )}
          
          {/* Campo dinamico (Direttore/Responsabile/Ufficio) */}
          {highlightName !== "N/D" && (
            <p className="mt-1 text-sm text-slate-600">{highlightLabel}: {highlightName}</p>
          )}
          
          {/* Bandierina sede per le persone */}
          {(node.type === "person" || node.type === "ceo") && node.metadata?.flag && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <img 
                src={`https://flagcdn.com/w40/${node.metadata.flag.toLowerCase().replace('.png', '')}.png`}
                alt={node.metadata?.sede || "Sede"}
                className="w-6 h-4 rounded shadow-sm border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-xs text-slate-500">{node.metadata?.sede}</span>
            </div>
          )}
        </div>

        {infoItems.length > 0 && (
          <div className="mx-6 mb-4 min-h-[6rem] border-t border-slate-200 pt-3 text-left text-xs text-slate-600">
            {infoItems.map((item) => (
              <p key={`${node.id}-${item.label}`} className="mb-1 leading-relaxed">
                <span className="font-semibold text-slate-700">{item.label}:</span> {item.value}
              </p>
            ))}
          </div>
        )}

        {computedHasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className={`absolute -bottom-6 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-50 border-2 border-blue-200 ${
              toggleDisabled ? "pointer-events-none cursor-not-allowed opacity-60 hover:bg-white" : ""
            }`}
            aria-label={effectiveIsExpanded ? "Comprimi sezione" : "Espandi sezione"}
            type="button"
            disabled={toggleDisabled}
          >
            {effectiveIsExpanded ? <MinusIcon /> : <PlusIcon />}
          </button>
        )}
      </div>

      {showChildren && (
        <div className="flex justify-center pt-20 children-container">
          {childrenToRender.map((childNode) => (
            <div key={childNode.id} className="px-4 tree-node-wrapper">
              <OrgChartNode
                node={childNode}
                onToggle={onToggle}
                depth={depth + 1}
                highlightedNodes={highlightedNodes}
                visibleNodes={visibleNodes}
                isSearchNarrowed={isSearchNarrowed}
                registerNodeElem={registerNodeElem}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgChartNode;
