import { useMemo } from 'react';
import type { Node } from '../types';

// ✨ Filtri con selezioni multiple
interface ActiveFilters {
  sede: string | null;
  dipartimento: Set<string>;
  ufficio: Set<string>;
  ruolo: Set<string>;
}

export const useFilters = (tree: Node | null, filters: ActiveFilters) => {
  const filteredNodes = useMemo(() => {
    if (!tree) return new Set<string>();
    
    const matchingNodes = new Set<string>();
    
    // Se nessun filtro è attivo, non evidenziare nulla
    const hasActiveFilters = 
      filters.dipartimento.size > 0 ||
      filters.ufficio.size > 0 ||
      filters.ruolo.size > 0;
    if (!hasActiveFilters) return matchingNodes;

    const checkNode = (node: Node): boolean => {
      let matches = true;

      // Controlla filtro dipartimento (multi-selezione)
      if (filters.dipartimento.size > 0) {
        matches = matches && filters.dipartimento.has(node.department || '');
      }

      // Controlla filtro ufficio (multi-selezione)
      if (filters.ufficio.size > 0) {
        matches = matches && filters.ufficio.has(node.metadata?.office || '');
      }

      // Controlla filtro ruolo (multi-selezione)
      if (filters.ruolo.size > 0) {
        matches = matches && filters.ruolo.has(node.role || '');
      }

      if (matches) {
        matchingNodes.add(node.id);
      }

      // Controlla ricorsivamente i figli
      if (node.children) {
        node.children.forEach(child => checkNode(child));
      }

      return matches;
    };

    checkNode(tree);
    return matchingNodes;
  }, [tree, filters]);

  // Calcola i nodi da espandere (percorso completo dagli antenati ai nodi filtrati)
  const nodesToExpand = useMemo(() => {
    if (!tree || filteredNodes.size === 0) return null;

    const nodesToReveal = new Set<string>();

    // Funzione helper per trovare il percorso di un nodo
    const findPathById = (node: Node, targetId: string, path: string[] = []): string[] | null => {
      const currentPath = [...path, node.id];

      if (node.id === targetId) {
        return currentPath;
      }

      if (!node.children) {
        return null;
      }

      for (const child of node.children) {
        const result = findPathById(child, targetId, currentPath);
        if (result) {
          return result;
        }
      }

      return null;
    };

    // Per ogni nodo filtrato, aggiungi tutti gli antenati al set
    filteredNodes.forEach(nodeId => {
      const pathIds = findPathById(tree, nodeId);
      if (pathIds) {
        pathIds.forEach(id => nodesToReveal.add(id));
      }
    });

    return nodesToReveal.size > 0 ? nodesToReveal : null;
  }, [tree, filteredNodes]);

  // Funzione per determinare quali nodi espandere (mantenuta per retrocompatibilità)
  const shouldExpandForFilter = (nodeId: string, tree: Node | null): boolean => {
    if (!tree || filteredNodes.size === 0) return false;

    const checkDescendants = (node: Node): boolean => {
      if (filteredNodes.has(node.id)) return true;
      if (node.children) {
        return node.children.some(child => checkDescendants(child));
      }
      return false;
    };

    const findAndCheck = (node: Node): boolean => {
      if (node.id === nodeId) {
        return checkDescendants(node);
      }
      if (node.children) {
        for (const child of node.children) {
          const result = findAndCheck(child);
          if (result) return result;
        }
      }
      return false;
    };

    return findAndCheck(tree);
  };

  const hasActiveFilters = 
    filters.dipartimento.size > 0 ||
    filters.ufficio.size > 0 ||
    filters.ruolo.size > 0;

  const filterCount = 
    filters.dipartimento.size +
    filters.ufficio.size +
    filters.ruolo.size;

  return {
    filteredNodes,
    shouldExpandForFilter,
    hasActiveFilters,
    filterCount,
    nodesToExpand // ✨ NUOVO: Set di nodi da espandere (come la ricerca)
  };
};
