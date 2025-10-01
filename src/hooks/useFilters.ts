import { useMemo } from 'react';
import type { Node } from '../types';

interface ActiveFilters {
  sede: string | null;
  dipartimento: string | null;
  ufficio: string | null;
  ruolo: string | null;
}

export const useFilters = (tree: Node | null, filters: ActiveFilters) => {
  const filteredNodes = useMemo(() => {
    if (!tree) return new Set<string>();
    
    const matchingNodes = new Set<string>();
    
    // Se nessun filtro è attivo, non evidenziare nulla
    const hasActiveFilters = Object.values(filters).some(v => v !== null);
    if (!hasActiveFilters) return matchingNodes;

    const checkNode = (node: Node): boolean => {
      let matches = true;

      // Controlla filtro sede
      if (filters.sede !== null) {
        const nodeSede = node.metadata?.sede || node.location;
        matches = matches && (nodeSede === filters.sede);
      }

      // Controlla filtro dipartimento
      if (filters.dipartimento !== null) {
        matches = matches && (node.department === filters.dipartimento);
      }

      // Controlla filtro ufficio
      if (filters.ufficio !== null) {
        matches = matches && (node.metadata?.office === filters.ufficio);
      }

      // Controlla filtro ruolo
      if (filters.ruolo !== null) {
        matches = matches && (node.role === filters.ruolo);
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

  // Funzione per determinare quali nodi espandere
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

  return {
    filteredNodes,
    shouldExpandForFilter,
    hasActiveFilters: Object.values(filters).some(v => v !== null),
    filterCount: Object.values(filters).filter(v => v !== null).length
  };
};
