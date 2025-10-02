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
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm ${
          isOpen
            ? "bg-emerald-500 text-white shadow-md"
            : "bg-white text-slate-700 hover:bg-emerald-50/80 border border-slate-300 hover:border-emerald-300"
        }`}
        type="button"
        disabled={isExporting}
        title="Menu export dati"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Esporta
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={exportJSON}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              type="button"
              disabled={isExporting}
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Esporta JSON</span>
            </button>
            <button
              onClick={exportCSV}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              type="button"
              disabled={isExporting}
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Esporta CSV</span>
            </button>
            <hr className="my-1 border-slate-200" />
            <button
              onClick={printChart}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              type="button"
              disabled={isExporting}
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
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
