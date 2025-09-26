
import React from 'react';
import type { Node } from '../types';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';

interface OrgChartNodeProps {
  node: Node;
  onToggle: (nodeId: string) => void;
  isRoot?: boolean;
}

const EmployeeCard: React.FC<{ node: Node; onToggle: () => void }> = ({ node, onToggle }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 w-64 min-w-64 mx-auto border-t-4 border-blue-600 hover:shadow-2xl transition-shadow duration-300 relative">
      <div className="flex flex-col items-center text-center">
        <img
          className="w-24 h-24 rounded-full object-cover border-4 border-slate-200"
          src={node.imageUrl}
          alt={node.name}
        />
        <h3 className="mt-3 text-lg font-bold text-slate-900">{node.name}</h3>
        <p className="text-blue-700 font-semibold text-sm">{node.role}</p>
        <div className="mt-2 text-xs text-slate-500 w-full pt-2 border-t border-slate-200">
            <p className="truncate"><span className="font-semibold">Dept:</span> {node.department}</p>
            <p className="truncate"><span className="font-semibold">Sede:</span> {node.location}</p>
        </div>
      </div>
       {node.children && node.children.length > 0 && (
          <button
            onClick={onToggle}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
            aria-label={node.isExpanded ? 'Collapse' : 'Expand'}
          >
              {node.isExpanded ? <MinusIcon /> : <PlusIcon />}
          </button>
        )}
    </div>
);

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node, onToggle, isRoot = false }) => {
  const handleToggle = () => {
    onToggle(node.id);
  };

  return (
    <div className={`flex flex-col items-center ${isRoot ? '' : 'tree-branch'}`}>
        <EmployeeCard node={node} onToggle={handleToggle} />

        {node.isExpanded && node.children && node.children.length > 0 && (
            <div className="flex justify-center pt-10 children-container">
                {node.children.map((childNode) => (
                    <div key={childNode.id} className="px-4 tree-node-wrapper">
                        <OrgChartNode node={childNode} onToggle={onToggle} />
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default OrgChartNode;
