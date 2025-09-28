import React from "react";
import type { Node } from "../types";
import PlusIcon from "./icons/PlusIcon";
import MinusIcon from "./icons/MinusIcon";

interface OrgChartNodeProps {
  node: Node;
  onToggle: (nodeId: string) => void;
  depth?: number;
}

const badgeColours: Record<Node["type"], string> = {
  root: "bg-emerald-100 text-emerald-700",
  ceo: "bg-amber-100 text-amber-700",
  sede: "bg-blue-100 text-blue-700",
  department: "bg-emerald-100 text-emerald-700",
  office: "bg-indigo-100 text-indigo-700",
  person: "bg-slate-200 text-slate-600",
};

const borderColours: Record<Node["type"], string> = {
  root: "border-emerald-500",
  ceo: "border-amber-500",
  sede: "border-blue-500",
  department: "border-emerald-500",
  office: "border-indigo-500",
  person: "border-slate-300",
};

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node, onToggle, depth = 0 }) => {
  const isRoot = node.type === "root";
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  const badge = node.metadata?.badge ?? node.type.toUpperCase();
  const badgeClass = badgeColours[node.type];
  const borderClass = borderColours[node.type];

  const title = isRoot ? "CLEVERTECH GLOBAL" : node.name;
  const qualification = node.metadata?.qualification ?? (isRoot ? node.role : node.role || "—");
  const highlight = node.type === "person" ? node.name : node.responsible ?? "—";
  const mansione = node.metadata?.mansione ?? (node.type === "person" ? node.role ?? "—" : node.role ?? "—");
  const age = node.metadata?.age != null ? String(node.metadata?.age) : "—";
  const order = node.metadata?.order != null ? String(node.metadata?.order) : node.order != null ? String(node.order) : "—";

  return (
    <div className={`flex flex-col items-center ${depth > 0 ? "tree-branch" : ""}`}>
      <div
        className={`relative w-72 max-w-xs rounded-2xl border bg-white shadow-lg transition-all duration-300 ${
          hasChildren ? "pb-10" : "pb-6"
        } ${borderClass}`}
      >
        <span className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest shadow ${badgeClass}`}>
          {badge}
        </span>

        <div className="flex flex-col items-center px-6 pt-6 pb-4 text-center">
          <div className="w-24 h-24 overflow-hidden rounded-full border-4 border-white shadow-inner">
            <img className="h-full w-full object-cover" src={node.imageUrl} alt={node.name} loading="lazy" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{qualification}</p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">{highlight}</p>
        </div>

        <div className="mx-6 mb-4 space-y-1 border-t border-slate-200 pt-3 text-left text-xs text-slate-600">
          <p>
            <span className="font-semibold text-slate-700">Mansione:</span> {mansione}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Età:</span> {age}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Ordinamento:</span> {order}
          </p>
        </div>

        {hasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className="absolute -bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-50"
            aria-label={node.isExpanded ? "Collapse" : "Expand"}
            type="button"
          >
            {node.isExpanded ? <MinusIcon /> : <PlusIcon />}
          </button>
        )}
      </div>

      {node.isExpanded && hasChildren && (
        <div className="flex justify-center pt-10 children-container">
          {node.children!.map((childNode) => (
            <div key={childNode.id} className="px-4 tree-node-wrapper">
              <OrgChartNode node={childNode} onToggle={onToggle} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgChartNode;
