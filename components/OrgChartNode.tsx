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
}

const badgeColours: Record<Node["type"], string> = {
  root: "bg-emerald-100 text-emerald-700",
  ceo: "bg-amber-100 text-amber-700",
  sede: "bg-blue-100 text-blue-700",
  department: "bg-emerald-100 text-emerald-700",
  office: "bg-indigo-100 text-indigo-700",
  person: "bg-slate-200 text-slate-600",
  qualification: "bg-amber-100 text-amber-700",
  "role-group": "bg-emerald-100 text-emerald-700",
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

  const badge = node.metadata?.badge ?? node.type.toUpperCase();
  const badgeClass = badgeColours[node.type] ?? "bg-slate-200 text-slate-600";
  const borderClass = borderColours[node.type] ?? "border-slate-300";

  const title = node.name;
  const subtitle = node.metadata?.qualification ?? (node.role || "N/D");
  const highlightName =
    (node.type === "person" || node.type === "ceo" ? node.name : node.responsible) ?? "N/D";
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

  if (node.type === "root" && stats) {
    if (stats.sites !== undefined) {
      addStat("Sedi", stats.sites);
      addStat("Dipartimenti", stats.departments);
      addStat("Uffici", stats.offices);
      addStat("Persone", stats.people);
    } else if (stats.qualifications !== undefined) {
      addStat("Qualifiche", stats.qualifications);
      addStat("Ruoli", stats.roles);
      addStat("Persone", stats.people);
    } else if (stats.leaders !== undefined) {
      addStat("Leader", stats.leaders);
      addStat("Persone", stats.people);
    }
  } else if (node.type === "sede") {
    infoItems.push({ label: "Direttore", value: highlightName });
    if (stats) {
      addStat("Dipartimenti", stats.departments);
      addStat("Uffici", stats.offices);
      addStat("Persone", stats.people);
    }
  } else if (node.type === "department") {
    if (highlightName !== "N/D") {
      infoItems.push({ label: "Responsabile", value: highlightName });
    }
    if (stats) {
      addStat("Uffici", stats.offices);
      addStat("Persone", stats.people);
    }
  } else if (node.type === "office") {
    if (highlightName !== "N/D") {
      infoItems.push({ label: "Responsabile", value: highlightName });
    }
    if (officePurpose) {
      infoItems.push({ label: "Scopo", value: officePurpose });
    }
    addStat("Persone", stats?.people);
  } else if (node.type === "qualification") {
    if (highlightName !== "N/D") {
      infoItems.push({ label: "Responsabile", value: highlightName });
    }
    if (stats) {
      addStat("Ruoli", stats.roles);
      addStat("Persone", stats.people);
    }
  } else if (node.type === "role-group") {
    if (highlightName !== "N/D") {
      infoItems.push({ label: "Responsabile", value: highlightName });
    }
    addStat("Persone", stats?.people);
  } else if (node.type === "person" || node.type === "ceo") {
    infoItems.push({ label: "Qualifica", value: subtitle });
    infoItems.push({ label: "Mansione", value: mansione });
    infoItems.push({ label: "Et\u00E0", value: age });
    infoItems.push({ label: "Ordinamento", value: order });
    if (reportsTo && reportsTo !== "N/D") {
      infoItems.push({ label: "Riporta a", value: reportsTo });
    }
    if (stats?.directs !== undefined && stats.directs > 0) {
      addStat("Diretti", stats.directs);
    }
    if (stats?.totalReports !== undefined && stats.totalReports > 0) {
      addStat("Report totali", stats.totalReports);
    }
  } else {
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
        className={`relative flex flex-col w-72 max-w-xs min-h-[26rem] rounded-2xl border bg-white shadow-lg transition-all duration-300 ${
          computedHasChildren ? "pb-10" : "pb-6"
        } ${borderClass} ${
          shouldHighlight
            ? "ring-4 ring-amber-300 ring-offset-2 ring-offset-white"
            : "ring-1 ring-slate-100"
        }`}
      >
        <span className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest shadow ${badgeClass}`}>
          {badge}
        </span>

        <div className="flex flex-col items-center px-6 pt-6 pb-4 text-center flex-1">
          <div className="w-24 h-24 overflow-hidden rounded-full border-4 border-white shadow-inner">
            <img className="h-full w-full object-cover" src={node.imageUrl} alt={node.name} loading="lazy" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && subtitle !== "N/D" && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
          {highlightName !== "N/D" && (
            <p className="mt-2 text-lg font-semibold text-emerald-700">{highlightName}</p>
          )}
        </div>

        {infoItems.length > 0 && (
          <div className="mx-6 mb-4 space-y-1 border-t border-slate-200 pt-3 text-left text-xs text-slate-600 flex-none">
            {infoItems.map((item) => (
              <p key={`${node.id}-${item.label}`}>
                <span className="font-semibold text-slate-700">{item.label}:</span> {item.value}
              </p>
            ))}
          </div>
        )}

        {computedHasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className={`absolute -bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-50 ${
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
        <div className="flex justify-center pt-10 children-container">
          {childrenToRender.map((childNode) => (
            <div key={childNode.id} className="px-4 tree-node-wrapper">
              <OrgChartNode
                node={childNode}
                onToggle={onToggle}
                depth={depth + 1}
                highlightedNodes={highlightedNodes}
                visibleNodes={visibleNodes}
                isSearchNarrowed={isSearchNarrowed}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgChartNode;
