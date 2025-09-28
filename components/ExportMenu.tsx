import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { Node } from '../types';

interface ExportMenuProps {
  tree: Node | null;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ tree }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const flattenTree = (node: Node): any[] => {
    const result: any[] = [];
    
    const traverse = (n: Node, path: string[] = []) => {
      const currentPath = [...path, n.name];
      
      result.push({
        id: n.id,
        nome: n.name,
        ruolo: n.role,
        dipartimento: n.department,
        sede: n.location,
        responsabile: n.responsible || '',
        tipo: n.type,
        mansione: n.metadata?.mansione || '',
        qualifica: n.metadata?.qualification || '',
        eta: n.metadata?.age || '',
        ordinamento: n.metadata?.order || n.order || '',
        percorso: currentPath.join(' > ')
      });

      if (n.children) {
        n.children.forEach(child => traverse(child, currentPath));
      }
    };

    if (tree) traverse(tree);
    return result;
  };

  const exportJSON = () => {
    if (!tree) return;
    
    setIsExporting(true);
    try {
      const data = flattenTree(tree);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organigramma-clevertech-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Esportazione JSON completata!');
    } catch (error) {
      toast.error('Errore durante l\'esportazione');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportCSV = () => {
    if (!tree) return;
    
    setIsExporting(true);
    try {
      const data = flattenTree(tree);
      const headers = ['ID', 'Nome', 'Ruolo', 'Dipartimento', 'Sede', 'Responsabile', 'Tipo', 'Mansione', 'Qualifica', 'Età', 'Ordinamento', 'Percorso'];
      
      const csvContent = [
        headers.join(';'),
        ...data.map(row => [
          row.id,
          row.nome,
          row.ruolo,
          row.dipartimento,
          row.sede,
          row.responsabile,
          row.tipo,
          row.mansione,
          row.qualifica,
          row.eta,
          row.ordinamento,
          row.percorso
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organigramma-clevertech-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Esportazione CSV completata!');
    } catch (error) {
      toast.error('Errore durante l\'esportazione');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const printChart = () => {
    toast('Preparazione stampa...', { icon: '🖨️' });
    setTimeout(() => {
      window.print();
      toast.success('Pronto per la stampa!');
    }, 500);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg border-2 border-slate-200 hover:border-green-400 transition-all duration-300"
        type="button"
        disabled={isExporting}
      >
        <svg 
          className="w-5 h-5 text-slate-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
          />
        </svg>
        <span className="text-slate-700 font-medium">Esporta</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="py-1">
            <button
              onClick={exportJSON}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              type="button"
              disabled={isExporting}
            >
              <span>📄</span>
              <span>Esporta JSON</span>
            </button>
            <button
              onClick={exportCSV}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              type="button"
              disabled={isExporting}
            >
              <span>📊</span>
              <span>Esporta CSV</span>
            </button>
            <hr className="my-1 border-slate-200" />
            <button
              onClick={printChart}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              type="button"
              disabled={isExporting}
            >
              <span>🖨️</span>
              <span>Stampa</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay per chiudere il menu quando si clicca fuori */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportMenu;
